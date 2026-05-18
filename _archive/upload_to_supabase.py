import os
import math
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase Client
url = os.getenv("SUPABASE_DATABASE_URL")
key = os.getenv("SUPABASE_DATABASE_ANON_KEY")
if not url or not key:
    raise ValueError("Supabase credentials not found in .env file!")
supabase: Client = create_client(url, key)

def clean_data_dict(d):
    """Recursively clean dict to handle NaNs and floats that should be ints/strings."""
    clean_d = {}
    for k, v in d.items():
        if pd.isna(v) or v == '' or v == ' ' or v == 'NaN':
            clean_d[k] = None
        else:
            clean_d[k] = str(v).strip() if not isinstance(v, (int, float)) else v
    return clean_d

def upload_colleges():
    print("Uploading Colleges Data...")
    file_path = "raw_data/college_info/manabadi_college_list_UPDATED_FEES.csv"
    if not os.path.exists(file_path):
        print(f"Skipping Colleges, file not found: {file_path}")
        return
    
    df = pd.read_csv(file_path)
    
    # Map to schema
    records = []
    for _, row in df.iterrows():
        try:
            fee_val = row.get('Updated_Fee_2026', row.get('fee'))
            if pd.isna(fee_val):
                fee_val = None
            else:
                fee_val = float(fee_val)
                
            record = {
                "inst_code": str(row.get('Institute Code', '')).strip(),
                "institute_name": str(row.get('Institute Name', '')).strip(),
                "place": str(row.get('Place', '')).strip(),
                "dist_name": str(row.get('Dist. Name', '')).strip(),
                "region": str(row.get('Region', '')).strip(),
                "college_type": str(row.get('College Type', '')).strip(),
                "minority": str(row.get('Minority', '')).strip(),
                "co_educ": str(row.get('Co- Educ.', '')).strip(),
                "affil_to": str(row.get('Affil. to', '')).strip(),
                "updated_fee_2026": fee_val
            }
            # Skip empty or invalid inst_code
            if not record['inst_code'] or record['inst_code'].lower() == 'nan':
                continue
                
            records.append(clean_data_dict(record))
        except Exception as e:
            print(f"Error parsing row: {e}")
            continue

    # Deduplicate records by inst_code before bulk insert
    unique_records = {}
    for r in records:
        unique_records[r['inst_code']] = r
    
    final_records = list(unique_records.values())

    # Bulk insert
    if final_records:
        try:
            # We'll use upsert to avoid duplicate key errors if run multiple times
            response = supabase.table("colleges").upsert(final_records, on_conflict="inst_code").execute()
            print(f"Successfully uploaded {len(final_records)} colleges.")
        except Exception as e:
            print(f"Failed to upload colleges: {e}")

def upload_cutoffs(stream, file_path):
    print(f"\nUploading Cutoffs for {stream}...")
    if not os.path.exists(file_path):
        print(f"Skipping {stream}, file not found: {file_path}")
        return
        
    df = pd.read_csv(file_path, low_memory=False)
    
    # We only want the standard columns to avoid pandas concat messes
    standard_columns = [
        'INST CODE', 'INSTITUTE NAME', 'PLACE', 'DIST', 'COED', 'TYPE', 'YEAR OF ESTB', 
        'BRANCH', 'BRANCH NAME', 'OC BOYS', 'OC GIRLS', 'BC_A BOYS', 'BC_A GIRLS', 
        'BC_B BOYS', 'BC_B GIRLS', 'BC_C BOYS', 'BC_C GIRLS', 'BC_D BOYS', 'BC_D GIRLS', 
        'BC_E BOYS', 'BC_E GIRLS', 'SC BOYS', 'SC GIRLS', 'ST BOYS', 'ST GIRLS', 
        'EWS GEN OU', 'EWS GIRLS OU', 'TUITION FEE', 'AFFILIATED', 'Year', 'Phase'
    ]
    
    # Filter only columns that exist in the dataframe
    cols_to_keep = [c for c in standard_columns if c in df.columns]
    df = df[cols_to_keep]
    
    records = []
    for _, row in df.iterrows():
        inst_code = str(row.get('INST CODE', '')).strip()
        # Skip header rows that got mixed into data, or empty codes
        if not inst_code or inst_code == 'nan' or inst_code == 'INST CODE':
            continue
            
        record = {
            "stream": stream,
            "inst_code": inst_code,
            "institute_name": row.get('INSTITUTE NAME'),
            "place": row.get('PLACE'),
            "dist": row.get('DIST'),
            "coed": row.get('COED'),
            "type": row.get('TYPE'),
            "year_of_estb": row.get('YEAR OF ESTB'),
            "branch": row.get('BRANCH'),
            "branch_name": row.get('BRANCH NAME'),
            "oc_boys": row.get('OC BOYS'),
            "oc_girls": row.get('OC GIRLS'),
            "bc_a_boys": row.get('BC_A BOYS'),
            "bc_a_girls": row.get('BC_A GIRLS'),
            "bc_b_boys": row.get('BC_B BOYS'),
            "bc_b_girls": row.get('BC_B GIRLS'),
            "bc_c_boys": row.get('BC_C BOYS'),
            "bc_c_girls": row.get('BC_C GIRLS'),
            "bc_d_boys": row.get('BC_D BOYS'),
            "bc_d_girls": row.get('BC_D GIRLS'),
            "bc_e_boys": row.get('BC_E BOYS'),
            "bc_e_girls": row.get('BC_E GIRLS'),
            "sc_boys": row.get('SC BOYS'),
            "sc_girls": row.get('SC GIRLS'),
            "st_boys": row.get('ST BOYS'),
            "st_girls": row.get('ST GIRLS'),
            "ews_gen_ou": row.get('EWS GEN OU'),
            "ews_girls_ou": row.get('EWS GIRLS OU'),
            "tuition_fee": row.get('TUITION FEE'),
            "affiliated": row.get('AFFILIATED'),
            "academic_year": row.get('Year'),
            "phase": row.get('Phase')
        }
        records.append(clean_data_dict(record))
        
    print(f"Parsed {len(records)} records for {stream}. Starting chunked upload...")
    
    # Upload in chunks of 500 to avoid request size limits
    chunk_size = 500
    total_uploaded = 0
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i+chunk_size]
        try:
            supabase.table("cutoffs").insert(chunk).execute()
            total_uploaded += len(chunk)
            print(f"Uploaded {total_uploaded}/{len(records)}...")
        except Exception as e:
            print(f"Error uploading chunk starting at index {i}: {e}")
            
    print(f"Finished uploading {stream}.")

if __name__ == "__main__":
    print("Starting Supabase Data Population...")
    upload_colleges()
    upload_cutoffs("MPC", "raw_data/cutoffs/MPC/MPC_MASTER_CUTOFFS.csv")
    upload_cutoffs("BiPC", "raw_data/cutoffs/BiPC/BiPC_MASTER_CUTOFFS.csv")
    print("Done!")
