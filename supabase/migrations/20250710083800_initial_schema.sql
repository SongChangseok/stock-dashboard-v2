-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stocks table
CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stock_name TEXT NOT NULL,
  ticker TEXT, -- 선택사항
  quantity DECIMAL(10,4) NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create target_portfolios table
CREATE TABLE target_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  allocations JSONB NOT NULL, -- {"AAPL": 30, "GOOGL": 25, "MSFT": 45}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_stocks_user_id ON stocks(user_id);
CREATE INDEX idx_target_portfolios_user_id ON target_portfolios(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_portfolios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for stocks
CREATE POLICY "Users can view own stocks" ON stocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stocks" ON stocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stocks" ON stocks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stocks" ON stocks
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for target_portfolios
CREATE POLICY "Users can view own target portfolios" ON target_portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own target portfolios" ON target_portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own target portfolios" ON target_portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own target portfolios" ON target_portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_stocks
  BEFORE UPDATE ON stocks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_target_portfolios
  BEFORE UPDATE ON target_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();