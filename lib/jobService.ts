import { supabase } from './supabase';
import { JobApplication } from '@/types';

export class JobService {
  static async getJobs(userId: string): Promise<JobApplication[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }

      // Convert Supabase data to our JobApplication type
      return data.map(job => ({
        id: job.id,
        userId: job.user_id,
        company: job.company,
        position: job.title,
        status: job.status || 'applied',
        appliedDate: new Date(job.applied_at),
        firstInterviewDate: job.first_call ? new Date(job.first_call) : null,
        responseTime: job.response_tim || null,
        contactPerson: job.contact_nam || null,
        jobUrl: job.job_link || null,
        notes: '', // We'll need to add this field to the database
        documents: [], // We'll need to add this field to the database
        createdAt: new Date(job.created_at),
        updatedAt: new Date(job.created_at)
      }));
    } catch (error) {
      console.error('Error in getJobs:', error);
      return [];
    }
  }

  static async saveJob(userId: string, jobData: Partial<JobApplication>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          user_id: userId,
          title: jobData.position || '',
          company: jobData.company || '',
          applied_at: jobData.appliedDate?.toISOString() || new Date().toISOString(),
          first_call: jobData.firstInterviewDate?.toISOString() || null,
          response_tim: jobData.responseTime || null,
          contact_nam: jobData.contactPerson || null,
          job_link: jobData.jobUrl || null,
          status: jobData.status || 'applied',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveJob:', error);
      return false;
    }
  }

  static async updateJob(jobId: string, updates: Partial<JobApplication>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: updates.position,
          company: updates.company,
          applied_at: updates.appliedDate?.toISOString(),
          first_call: updates.firstInterviewDate?.toISOString(),
          response_tim: updates.responseTime,
          contact_nam: updates.contactPerson,
          job_link: updates.jobUrl,
          status: updates.status
        })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateJob:', error);
      return false;
    }
  }

  static async deleteJob(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteJob:', error);
      return false;
    }
  }
}
