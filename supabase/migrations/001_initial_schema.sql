-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create stocks table
CREATE TABLE IF NOT EXISTS public.stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  ticker_symbol TEXT,
  stock_name TEXT NOT NULL,
  quantity DECIMAL(15,6) NOT NULL CHECK (quantity > 0),
  purchase_price DECIMAL(15,2) NOT NULL CHECK (purchase_price > 0),
  current_price DECIMAL(15,2) NOT NULL CHECK (current_price > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on stocks
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- Create stocks policies
CREATE POLICY "Users can view own stocks" ON public.stocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stocks" ON public.stocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stocks" ON public.stocks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stocks" ON public.stocks
  FOR DELETE USING (auth.uid() = user_id);

-- Create target_portfolios table
CREATE TABLE IF NOT EXISTS public.target_portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  ticker_symbol TEXT,
  stock_name TEXT NOT NULL,
  target_percentage DECIMAL(5,2) NOT NULL CHECK (target_percentage >= 0 AND target_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ticker_symbol)
);

-- Enable RLS on target_portfolios
ALTER TABLE public.target_portfolios ENABLE ROW LEVEL SECURITY;

-- Create target_portfolios policies
CREATE POLICY "Users can view own target portfolios" ON public.target_portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own target portfolios" ON public.target_portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own target portfolios" ON public.target_portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own target portfolios" ON public.target_portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at
  BEFORE UPDATE ON public.stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_portfolios_updated_at
  BEFORE UPDATE ON public.target_portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();