alias flac_to_mp3='for file in *.flac; do ffmpeg -i "$file" -codec:a libmp3lame -qscale:a 2 "${file%.flac}.mp3"; done'
alias mp3_to_aac='for file in *.mp3; do ffmpeg -i "$file" -c:a aac -b:a 192k "${file%.flac}.aac"; done'
alias mp3_to_m4r='for file in *.mp3; do ffmpeg -i "$file" -acodec aac -ab 128k -ar 44100 -f mp4 "${file%.flac}.m4r"; done'
