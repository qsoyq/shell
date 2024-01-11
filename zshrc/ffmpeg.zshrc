alias flac_to_mp3='for file in *.flac; do ffmpeg -i "$file" -codec:a libmp3lame -qscale:a 2 "${file%.flac}.mp3"; done'
