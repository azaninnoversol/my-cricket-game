import { supabase } from "@/lib/supabaseClient";

interface SignInResult {
  success: boolean;
  message?: string;
  data?: {
    user: any;
    profile?: any;
  };
}

const signUpUser = async (email: string, password: string, username: string): Promise<SignInResult> => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data?.user) {
    return { success: false, message: error?.message || "Signup failed" };
  }

  const userId = data.user.id;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .insert([{ id: userId, username, email }])
    .select()
    .single();

  if (profileError) {
    return { success: false, message: profileError.message };
  }

  return { success: true, data: { user: data.user, profile: profileData } };
};

const signInUser = async (email: string, password: string): Promise<SignInResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return { success: false, message: error?.message || "Login failed" };
    }

    const userId = data.user.id;

    const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (profileError) {
      return { success: true, data: { user: data.user } };
    }

    return { success: true, data: { user: data.user, profile: profileData } };
  } catch (err: any) {
    return { success: false, message: err.message || "Something went wrong" };
  }
};

export { signUpUser, signInUser };
