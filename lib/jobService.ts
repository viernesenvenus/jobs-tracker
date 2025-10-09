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
        role: job.title || '',
        company: job.company || '',
        position: job.title || '',
        source: 'other' as const,
        applicationDate: new Date(job.applied_at),
        firstInterviewDate: job.first_call ? new Date(job.first_call) : undefined,
        responseTime: job.response_time || undefined,
        contactPerson: job.contact_name || undefined,
        contactEmail: undefined,
        contactPhone: undefined,
        jobLink: job.job_link || undefined,
        jobDescription: undefined,
        status: (job.status || 'applied') as any,
        nextAction: undefined,
        notes: undefined,
        cvId: undefined,
        adaptedCvId: undefined,
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
      console.log('🔍 JobService.saveJob called with:', { userId, jobData });
      
      const insertData = {
        id: crypto.randomUUID(),
        user_id: userId,
        title: jobData.position || '',
        company: jobData.company || '',
        applied_at: jobData.applicationDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        first_call: jobData.firstInterviewDate?.toISOString() || null,
        response_time: jobData.responseTime || null,
        contact_name: jobData.contactPerson || null,
        job_link: jobData.jobLink || null,
        status: jobData.status || 'applied',
        created_at: new Date().toISOString()
      };
      
      console.log('📝 Inserting data:', insertData);
      
      const { error } = await supabase
        .from('jobs')
        .insert(insertData);

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
      console.log('🔍 JobService.updateJob called with:', { jobId, updates });
      
      const updateData = {
        title: updates.position,
        company: updates.company,
        applied_at: updates.applicationDate?.toISOString().split('T')[0],
        first_call: updates.firstInterviewDate?.toISOString().split('T')[0] || null,
        response_time: updates.responseTime || null,
        contact_name: updates.contactPerson || null,
        job_link: updates.jobLink || null,
        status: updates.status
      };
      
      console.log('📝 Updating job with data:', updateData);
      
      const { error } = await supabase
        .from('jobs')
        .update(updateData)
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
