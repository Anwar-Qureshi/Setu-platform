-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Drop the old 768-dimensional table if it exists so we can rebuild it for 384 dimensions
drop table if exists rulebook_chunks cascade;

-- Create a table to store your documents and their embeddings
create table if not exists rulebook_chunks (
  id bigserial primary key,
  content text not null, -- The actual text chunk
  metadata jsonb, -- Metadata like filename, page number, source (official vs blog)
  embedding vector(384) -- HuggingFace all-MiniLM-L6-v2 uses 384 dimensions
);

-- Create a function to search for documents via similarity
create or replace function match_rulebook_chunks (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    rulebook_chunks.id,
    rulebook_chunks.content,
    rulebook_chunks.metadata,
    1 - (rulebook_chunks.embedding <=> query_embedding) as similarity
  from rulebook_chunks
  where 1 - (rulebook_chunks.embedding <=> query_embedding) > match_threshold
  order by rulebook_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- Enable Row Level Security (RLS) but allow anonymous read access
alter table rulebook_chunks enable row level security;
create policy "Allow public read access to rulebooks" on rulebook_chunks for select using (true);
create policy "Allow public all access to rulebooks" on rulebook_chunks for all using (true);
