-- Create portfolio_snapshots table for daily portfolio data
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  snapshot_date DATE NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  total_gain_loss DECIMAL(15,2) NOT NULL,
  total_gain_loss_percentage DECIMAL(8,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- Create stock_snapshots table for individual stock data
CREATE TABLE stock_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_snapshot_id UUID REFERENCES portfolio_snapshots(id) ON DELETE CASCADE NOT NULL,
  stock_name TEXT NOT NULL,
  ticker TEXT,
  quantity DECIMAL(10,4) NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  gain_loss DECIMAL(15,2) NOT NULL,
  gain_loss_percentage DECIMAL(8,4) NOT NULL,
  weight_percentage DECIMAL(8,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
CREATE INDEX idx_stock_snapshots_portfolio_id ON stock_snapshots(portfolio_snapshot_id);

-- Enable Row Level Security (RLS)
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portfolio_snapshots
CREATE POLICY "Users can view own portfolio snapshots" ON portfolio_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio snapshots" ON portfolio_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio snapshots" ON portfolio_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio snapshots" ON portfolio_snapshots
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for stock_snapshots
CREATE POLICY "Users can view own stock snapshots" ON stock_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolio_snapshots ps 
      WHERE ps.id = stock_snapshots.portfolio_snapshot_id 
      AND ps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own stock snapshots" ON stock_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_snapshots ps 
      WHERE ps.id = stock_snapshots.portfolio_snapshot_id 
      AND ps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own stock snapshots" ON stock_snapshots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM portfolio_snapshots ps 
      WHERE ps.id = stock_snapshots.portfolio_snapshot_id 
      AND ps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own stock snapshots" ON stock_snapshots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM portfolio_snapshots ps 
      WHERE ps.id = stock_snapshots.portfolio_snapshot_id 
      AND ps.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at timestamps
CREATE TRIGGER set_timestamp_portfolio_snapshots
  BEFORE UPDATE ON portfolio_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_stock_snapshots
  BEFORE UPDATE ON stock_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Create function to automatically create daily snapshots
CREATE OR REPLACE FUNCTION create_daily_portfolio_snapshot(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
  v_snapshot_id UUID;
  v_total_value DECIMAL(15,2) := 0;
  v_total_cost DECIMAL(15,2) := 0;
  v_stock_record RECORD;
BEGIN
  -- Calculate totals from current stocks
  FOR v_stock_record IN 
    SELECT 
      stock_name,
      ticker,
      quantity,
      purchase_price,
      current_price,
      (quantity * current_price) as total_value,
      (quantity * purchase_price) as total_cost,
      (quantity * current_price) - (quantity * purchase_price) as gain_loss,
      CASE 
        WHEN (quantity * purchase_price) > 0 
        THEN ((quantity * current_price) - (quantity * purchase_price)) / (quantity * purchase_price) * 100
        ELSE 0 
      END as gain_loss_percentage
    FROM stocks 
    WHERE user_id = p_user_id
  LOOP
    v_total_value := v_total_value + v_stock_record.total_value;
    v_total_cost := v_total_cost + v_stock_record.total_cost;
  END LOOP;

  -- Insert portfolio snapshot
  INSERT INTO portfolio_snapshots (
    user_id,
    snapshot_date,
    total_value,
    total_cost,
    total_gain_loss,
    total_gain_loss_percentage
  ) VALUES (
    p_user_id,
    p_date,
    v_total_value,
    v_total_cost,
    v_total_value - v_total_cost,
    CASE 
      WHEN v_total_cost > 0 
      THEN (v_total_value - v_total_cost) / v_total_cost * 100
      ELSE 0 
    END
  ) 
  ON CONFLICT (user_id, snapshot_date) 
  DO UPDATE SET
    total_value = EXCLUDED.total_value,
    total_cost = EXCLUDED.total_cost,
    total_gain_loss = EXCLUDED.total_gain_loss,
    total_gain_loss_percentage = EXCLUDED.total_gain_loss_percentage,
    updated_at = NOW()
  RETURNING id INTO v_snapshot_id;

  -- Delete existing stock snapshots for this date
  DELETE FROM stock_snapshots 
  WHERE portfolio_snapshot_id = v_snapshot_id;

  -- Insert stock snapshots
  FOR v_stock_record IN 
    SELECT 
      stock_name,
      ticker,
      quantity,
      purchase_price,
      current_price,
      (quantity * current_price) as total_value,
      (quantity * purchase_price) as total_cost,
      (quantity * current_price) - (quantity * purchase_price) as gain_loss,
      CASE 
        WHEN (quantity * purchase_price) > 0 
        THEN ((quantity * current_price) - (quantity * purchase_price)) / (quantity * purchase_price) * 100
        ELSE 0 
      END as gain_loss_percentage,
      CASE 
        WHEN v_total_value > 0 
        THEN (quantity * current_price) / v_total_value * 100
        ELSE 0 
      END as weight_percentage
    FROM stocks 
    WHERE user_id = p_user_id
  LOOP
    INSERT INTO stock_snapshots (
      portfolio_snapshot_id,
      stock_name,
      ticker,
      quantity,
      purchase_price,
      current_price,
      total_value,
      total_cost,
      gain_loss,
      gain_loss_percentage,
      weight_percentage
    ) VALUES (
      v_snapshot_id,
      v_stock_record.stock_name,
      v_stock_record.ticker,
      v_stock_record.quantity,
      v_stock_record.purchase_price,
      v_stock_record.current_price,
      v_stock_record.total_value,
      v_stock_record.total_cost,
      v_stock_record.gain_loss,
      v_stock_record.gain_loss_percentage,
      v_stock_record.weight_percentage
    );
  END LOOP;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;