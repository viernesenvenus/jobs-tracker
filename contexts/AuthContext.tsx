'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, OnboardingData } from '@/types';
import { supabase } from '@/lib/supabase';
import { profileService } from '@/lib/profileService';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback timeout to ensure loading never gets stuck
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      console.log('⚠️ Fallback timeout: Forcing loading to false');
      setIsLoading(false);
    }, 15000); // 15 seconds max

    return () => clearTimeout(fallbackTimeout);
  }, []);

  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        console.log('📊 Session result:', session ? 'Found' : 'Not found');
        
        if (session?.user) {
          console.log('👤 User found, loading data...');
          await loadUserData(session.user);
          console.log('✅ User data loaded, not redirecting from initial session');
        } else {
          console.log('👤 No user session found');
        }
      } catch (error) {
        console.error('❌ Error getting initial session:', error);
        // Don't let errors prevent the app from loading
      } finally {
        console.log('✅ Setting loading to false');
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        if (session?.user) {
          await loadUserData(session.user);
          console.log('✅ User data loaded from auth state change');
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle URL hash for OAuth redirects
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash.includes('access_token')) {
        console.log('Processing OAuth redirect...');
        try {
          // Wait a bit for Supabase to process the token
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error processing OAuth redirect:', error);
          } else if (data.session?.user) {
            console.log('OAuth redirect successful, loading user data...');
            await loadUserData(data.session.user);
            
            // Redirect to dashboard after successful OAuth login
            console.log('OAuth redirect successful, redirecting to dashboard');
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Error handling OAuth redirect:', error);
        }
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🔍 Loading user data for:', supabaseUser.email);
      console.log('User ID:', supabaseUser.id);
      
      // Add timeout for profile loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 8000)
      );
      
      const profilePromise = profileService.getProfileByUserId(supabaseUser.id);
      
      const { data: profile, error: profileError } = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      console.log('Profile search result:', { profile, profileError });
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      }

      let currentProfile = profile;

      // Si no existe el perfil, crearlo
      if (!profile && !profileError) {
        console.log('📝 Creating new profile...');
        
        const newProfile = {
          id: supabaseUser.id,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuario',
          email: supabaseUser.email || '',
          role: 'user'
        };

        console.log('New profile data:', newProfile);

        const { data: createdProfile, error: createError } = await profileService.createProfile(newProfile);
        
        console.log('Profile creation result:', { createdProfile, createError });
        
        if (createError) {
          console.error('❌ Error creating profile:', createError);
          console.error('Error details:', {
            message: createError.message,
            code: createError.code,
            details: createError.details,
            hint: createError.hint
          });
        } else {
          console.log('✅ Profile created successfully:', createdProfile);
          currentProfile = createdProfile;
        }
      } else if (profile) {
        console.log('✅ Profile already exists:', profile);
        // Si el perfil existe, actualizar con la información más reciente de Google
        const googleName = supabaseUser.user_metadata?.full_name;
        const googleEmail = supabaseUser.email;
        
        // Solo actualizar si hay información nueva de Google
        if (googleName && googleName !== profile.full_name) {
          const { data: updatedProfile, error: updateError } = await profileService.updateProfile(supabaseUser.id, {
            full_name: googleName,
            email: googleEmail || profile.email
          });
          
          if (updateError) {
            console.error('Error updating profile with Google data:', updateError);
          } else {
            currentProfile = updatedProfile;
          }
        }
      }

      // Convert Supabase user to our User type
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: currentProfile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuario',
        onboardingCompleted: supabaseUser.user_metadata?.onboarding_completed || false,
        preferences: {
          notifications: true,
          language: 'es',
          priorityFeatures: supabaseUser.user_metadata?.priority_features || [],
          activeProcesses: supabaseUser.user_metadata?.active_processes || 0
        },
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date()
      };

      console.log('✅ Final user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        return false;
      }

      if (data.user) {
        console.log('✅ Login successful, loading user data...');
        await loadUserData(data.user);
        console.log('✅ User data loaded successfully');
      }

      return true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Google login error:', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Google login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Starting registration for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            onboarding_completed: false
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          code: error.code
        });
        
        // Si el error es por confirmación de email, mostrar mensaje específico
        if (error.message.includes('signup is disabled') || error.message.includes('email not confirmed')) {
          console.log('Email confirmation required - this is expected behavior');
          // En desarrollo, podemos continuar aunque requiera confirmación
          // En producción, deberías mostrar un mensaje al usuario
        }
        
        return false;
      }

      console.log('Registration successful:', data);

      // Si el usuario se creó exitosamente, crear el perfil
      if (data.user) {
        console.log('Creating profile for user:', data.user.id);
        
        const newProfile = {
          id: data.user.id,
          full_name: name,
          email: email,
          role: 'user'
        };

        const { error: profileError } = await profileService.createProfile(newProfile);
        
        if (profileError) {
          console.error('Error creating profile during registration:', profileError);
          // No retornamos false aquí porque el usuario ya se creó en Supabase
        } else {
          console.log('Profile created successfully');
        }

        // Load user data immediately after registration
        await loadUserData(data.user);
      }

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const completeOnboarding = async (data: OnboardingData): Promise<boolean> => {
    try {
      if (!user) return false;
      
      console.log('🚀 Completing onboarding for user:', user.id);
      console.log('📝 Onboarding data:', data);
      
      // Intentar actualizar el usuario en Supabase Auth
      const { data: updatedUser, error } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          desired_role: data.desiredRole,
          priority_features: data.priorityFeatures,
          active_processes: data.activeProcesses === 'none' ? 0 : data.activeProcesses === '1-2' ? 1 : 3
        }
      });

      if (error) {
        console.error('❌ Onboarding completion error:', error.message);
        console.error('Full error:', error);
        return false; // Retornar false si hay error
      }

      console.log('✅ Onboarding completed successfully in Supabase');
      console.log('✅ Updated user metadata:', updatedUser?.user?.user_metadata);
      
      // Actualizar el estado local del usuario con los datos confirmados de Supabase
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          onboardingCompleted: true,
          preferences: {
            ...prevUser.preferences,
            priorityFeatures: data.priorityFeatures,
            activeProcesses: data.activeProcesses === 'none' ? 0 : data.activeProcesses === '1-2' ? 1 : 3
          }
        };
      });
      
      return true;
    } catch (error) {
      console.error('❌ Onboarding completion failed:', error);
      return false; // Retornar false si hay excepción
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Actualizar en Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.name,
          ...updates.preferences
        }
      });

      if (error) {
        console.error('User update error:', error.message);
        return false;
      }

      // Actualizar en la tabla profiles
      if (updates.name) {
        const { error: profileError } = await profileService.updateProfile(user.id, {
          full_name: updates.name
        });

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      }

      return true;
    } catch (error) {
      console.error('User update failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      completeOnboarding,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}