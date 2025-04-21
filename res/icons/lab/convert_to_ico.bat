@echo off
magick "%~1" -resize 256x256 -define icon:auto-resize=256,128,64,48,32,16 "%~n1.ico"