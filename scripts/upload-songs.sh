#!/bin/bash

# Load environment variables if .env exists
if [ -f ../.env ]; then
    source ../.env
else
    echo "Error: .env file not found"
    exit 1
fi

# Set Deuxfleurs credentials
S3_ACCESS_KEY="GKa8bf55babca0f2e4c588c7b6"
S3_SECRET_KEY="d3a330bd1dd024c2053292cba525bac007075f2bd1d8a3b8c7fa9036976e6d92"  # Replace with actual secret key

# Configure AWS CLI with SSL verification disabled
aws configure set aws_access_key_id "$S3_ACCESS_KEY" --profile atlantify
aws configure set aws_secret_access_key "$S3_SECRET_KEY" --profile atlantify
aws configure set region "garage" --profile atlantify
aws configure set endpoint_url "https://garage.deuxfleurs.fr" --profile atlantify
aws configure set ca_bundle /dev/null --profile atlantify

# Function to sanitize filenames
sanitize_filename() {
    echo "$1" | tr -cd '[:alnum:]._-' | tr '[:upper:]' '[:lower:]'
}

# Function to get file size
get_filesize() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$1"
    else
        stat -c%s "$1"
    fi
}

# Function to get audio duration using ffprobe
get_duration() {
    duration=$(ffprobe -i "$1" -show_entries format=duration -v quiet -of csv="p=0")
    echo "${duration%.*}" # Convert to whole seconds
}

# Function to generate UUID v4
generate_uuid() {
    python3 -c 'import uuid; print(str(uuid.uuid4()))'
}

# Create songs directory if it doesn't exist
mkdir -p songs

# Admin user ID from seed file (you might want to change this or make it configurable)
ADMIN_ID="4652aace-cbad-441c-b25c-073e7215313f"

# Process and upload each MP3 file
for file in *.mp3; do
    # Skip if no files found
    [ -e "$file" ] || continue
    
    echo "Processing $file..."
    
    # Sanitize filename
    filename=$(sanitize_filename "$(basename "$file" .mp3)")
    filesize=$(get_filesize "$file")
    duration=$(get_duration "$file")
    
    # Copy file to songs directory with sanitized name
    cp "$file" "songs/${filename}.mp3"
    
    # Upload to Deuxfleurs using aws cli with SSL verification disabled
    if AWS_CA_BUNDLE=/dev/null aws --profile atlantify s3 cp \
        "songs/${filename}.mp3" \
        "s3://atlantify/songs/${filename}.mp3" \
        --content-type "audio/mpeg" \
        --no-verify-ssl; then
        
        echo "Creating database entry for ${filename}..."
        
        # Get title and artist from filename
        if [[ "$filename" == *"-"* ]]; then
            artist=$(echo "$filename" | cut -d'-' -f1 | xargs)
            title=$(echo "$filename" | cut -d'-' -f2- | xargs)
        else
            artist="Unknown"
            title="$filename"
        fi
        
        # Create database entry
        curl -X POST "http://localhost:4000/api/songs/upload" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_TOKEN" \
            -d "{
                \"title\": \"$title\",
                \"artist\": \"$artist\",
                \"duration\": $duration,
                \"path\": \"songs/${filename}.mp3\",
                \"uploadedBy\": \"$ADMIN_ID\",
                \"size\": $filesize
            }"
        
        echo -e "\nSuccessfully processed ${filename}"
    else
        echo "Error: Failed to upload ${filename}"
    fi
    
    echo "-----------------------------------"
done

# Clean up temporary directory
rm -rf songs

echo "Upload process complete!"