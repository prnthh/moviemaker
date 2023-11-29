#!/bin/bash

startrange=1
intervalsize=100
endrange=$(($startrange + $intervalsize))

for (( i=$startrange; i<$endrange; i+=1 ))
do
    ffmpeg -y -i output/$i.mkv -vf "fps=10,scale=400:-1:flags=lanczos" -c:v gif -f gif output/$i.gif
    gifsicle -O3 output/$i.gif -o upload/$i.gif
done

zip -vrj upload.zip upload/ -x "*.DS_Store"
