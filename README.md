# Supabase File Upload Application

## Overview
This is a simple web application that allows users to upload, list, download, and delete files using Supabase storage and database.

## Features
- File upload to Supabase storage
- File listing from Supabase database
- Download and delete file functionality
- Responsive design with Bootstrap

## Prerequisites
- A Supabase account
- A Supabase project with:
  - Storage bucket named "Documents_bucket"
  - Documents table with columns: id, created_at, name, size, type, path, status

## Setup
1. Clone the repository
2. Replace Supabase URL and Anon Key in `app.js` with your project's credentials
3. Ensure you have created the required Supabase storage bucket and database table

## Supabase Table Schema
Create a table named `documents` with the following columns:
- `id`: bigint (primary key)
- `created_at`: timestamp with time zone
- `name`: text
- `size`: bigint
- `type`: text
- `path`: text
- `status`: text

## Deployment
This application can be easily deployed using GitHub Pages.

## Technologies Used
- Supabase
- Bootstrap
- JavaScript

## License
MIT License
