-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  marks_percentage DECIMAL(5,2),
  main_skill TEXT,
  interest_area TEXT,
  goals TEXT,
  hobbies TEXT,
  daily_habits TEXT,
  location_city TEXT,
  location_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create assessment_questions table
CREATE TABLE public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  domain TEXT NOT NULL,
  question_type TEXT DEFAULT 'scale',
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on assessment_questions
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can read questions
CREATE POLICY "Anyone can view questions"
  ON public.assessment_questions FOR SELECT
  USING (true);

-- Create assessment_answers table
CREATE TABLE public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE NOT NULL,
  answer_value INTEGER NOT NULL CHECK (answer_value >= 1 AND answer_value <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS on assessment_answers
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

-- Users can only access their own answers
CREATE POLICY "Users can view their own answers"
  ON public.assessment_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own answers"
  ON public.assessment_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers"
  ON public.assessment_answers FOR UPDATE
  USING (auth.uid() = user_id);

-- Create career_recommendations table
CREATE TABLE public.career_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dominant_domain TEXT NOT NULL,
  primary_career TEXT NOT NULL,
  reasoning TEXT,
  score_breakdown JSONB,
  alternative_careers JSONB,
  skill_gaps JSONB,
  roadmap_steps JSONB,
  recommended_resources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on career_recommendations
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.career_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations"
  ON public.career_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON public.career_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create colleges table
CREATE TABLE public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  domain TEXT NOT NULL,
  course TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on colleges
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Anyone can view colleges
CREATE POLICY "Anyone can view colleges"
  ON public.colleges FOR SELECT
  USING (true);

-- Insert 20 assessment questions
INSERT INTO public.assessment_questions (text, domain, order_number) VALUES
  ('I enjoy solving complex logical problems', 'analytical', 1),
  ('I like working with computers and technology', 'technology', 2),
  ('I prefer creative tasks over structured ones', 'creativity', 3),
  ('I enjoy leading and organizing groups of people', 'leadership', 4),
  ('I like helping others learn new things', 'education', 5),
  ('I am comfortable with public speaking', 'communication', 6),
  ('I enjoy analyzing data and finding patterns', 'analytical', 7),
  ('I like creating art, music, or design', 'creativity', 8),
  ('I prefer working independently', 'independence', 9),
  ('I enjoy building or fixing things', 'technical', 10),
  ('I like understanding how businesses operate', 'business', 11),
  ('I am interested in social causes and making a difference', 'social', 12),
  ('I enjoy reading and writing', 'literacy', 13),
  ('I like conducting experiments and research', 'research', 14),
  ('I am good at managing budgets and resources', 'management', 15),
  ('I enjoy collaborating with diverse teams', 'teamwork', 16),
  ('I like staying updated with latest technology trends', 'technology', 17),
  ('I am passionate about music or performing arts', 'arts', 18),
  ('I enjoy planning and strategy development', 'planning', 19),
  ('I like mentoring and guiding others', 'mentorship', 20);

-- Insert sample colleges
INSERT INTO public.colleges (name, city, state, domain, course, website) VALUES
  ('Indian Institute of Technology Delhi', 'New Delhi', 'Delhi', 'Technology', 'B.Tech Computer Science', 'https://www.iitd.ac.in'),
  ('Indian Institute of Technology Bombay', 'Mumbai', 'Maharashtra', 'Technology', 'B.Tech Information Technology', 'https://www.iitb.ac.in'),
  ('National Institute of Design', 'Ahmedabad', 'Gujarat', 'Art', 'B.Des Product Design', 'https://www.nid.edu'),
  ('Indian Institute of Management Ahmedabad', 'Ahmedabad', 'Gujarat', 'Business', 'MBA', 'https://www.iima.ac.in'),
  ('Berklee College of Music India', 'Mumbai', 'Maharashtra', 'Music', 'Bachelor of Music', 'https://india.berklee.edu'),
  ('Delhi University', 'New Delhi', 'Delhi', 'Education', 'B.Ed', 'https://www.du.ac.in'),
  ('Symbiosis Institute of Design', 'Pune', 'Maharashtra', 'Art', 'B.Des Fashion Design', 'https://www.sid.edu'),
  ('BITS Pilani', 'Pilani', 'Rajasthan', 'Technology', 'B.Tech Software Engineering', 'https://www.bits-pilani.ac.in'),
  ('National Institute of Fashion Technology', 'New Delhi', 'Delhi', 'Art', 'B.Des Fashion Communication', 'https://www.nift.ac.in'),
  ('Indian School of Business', 'Hyderabad', 'Telangana', 'Business', 'MBA', 'https://www.isb.edu'),
  ('Tata Institute of Social Sciences', 'Mumbai', 'Maharashtra', 'Education', 'BA Social Work', 'https://www.tiss.edu'),
  ('VIT Vellore', 'Vellore', 'Tamil Nadu', 'Technology', 'B.Tech Computer Science', 'https://vit.ac.in'),
  ('KM Music Conservatory', 'Chennai', 'Tamil Nadu', 'Music', 'Diploma in Music Production', 'https://www.kmmc.in'),
  ('Xavier School of Management', 'Jamshedpur', 'Jharkhand', 'Business', 'MBA', 'https://www.xlri.ac.in'),
  ('Srishti Institute of Art Design', 'Bangalore', 'Karnataka', 'Art', 'B.Des Visual Communication', 'https://www.srishtimanipalinstitute.in');

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_recommendations_updated_at
  BEFORE UPDATE ON public.career_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();