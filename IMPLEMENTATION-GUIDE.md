# Supabase Implementation Guide for Freelance Marketplace

This guide provides step-by-step instructions to set up Supabase for the freelance marketplace platform.

## 1. Set Up Tables in Supabase

Login to your Supabase dashboard at https://app.supabase.io/ and select your project. Then follow these steps:

1. Go to the SQL Editor in your Supabase dashboard
2. Create the tables by copying and pasting the SQL from the `supabase-setup.sql` file
3. Run the SQL commands to create all required tables:
   - profiles
   - jobs
   - milestones
   - health_check

## 2. Add Test Data (Optional)

To test your implementation without creating accounts:

1. Go to the SQL Editor in your Supabase dashboard
2. Paste the content of `supabase-test-data.sql`
3. Replace the placeholder user IDs (`00000000-0000-0000-0000-000000000000`) with actual user IDs:
   - To find real user IDs, go to Authentication → Users in Supabase dashboard
   - Or modify the SQL to use a valid UUID without referential integrity

## 3. Test Your Frontend Connection

1. Run your backend application on port 8000:
   ```bash
   cd backend && PORT=8000 npm run dev
   ```

2. In a new terminal, run your frontend application:
   ```bash
   cd frontend && REACT_APP_API_URL=http://localhost:8000/api npm start
   ```

3. Register a new user (this will create a user in Supabase Auth)
4. After logging in, try to create a new job
5. Navigate to the Marketplace to see the job you created

## 4. Troubleshooting

### Common Issues

1. **Authentication Problems**
   - Ensure you're using the correct Supabase URL and anon key
   - Check browser console for auth errors

2. **Missing Tables**
   - Verify all tables have been created in Supabase
   - Check for SQL errors when creating tables

3. **Database Relationship Errors**
   - Foreign key errors can occur if user IDs don't exist
   - If using test data, make sure creator_id matches a valid user ID

4. **API Errors**
   - 400 errors might indicate a schema mismatch between frontend and database
   - Check the backend logs for specific error messages

### Testing Direct Supabase Connection

You can test your Supabase connection directly using curl:

```bash
curl https://okfjxtvdwdvflfjykpyi.supabase.co/rest/v1/health_check -H "apikey: YOUR_SUPABASE_ANON_KEY"
```

## 5. Advanced Configuration

### Row Level Security

Supabase uses Row Level Security (RLS) policies to control access to your data. The SQL provided includes RLS policies, but you may need to adjust them based on your specific requirements.

### Supabase Edge Functions

For complex business logic, consider implementing Supabase Edge Functions:

1. Install Supabase CLI
2. Create and deploy edge functions for milestone approvals, payment processing, etc.

## 6. Next Steps

After implementing the basic marketplace functionality:

1. Add job search functionality
2. Implement proposal submissions for freelancers
3. Add milestone tracking and payment integration
4. Enhance the user profile system 