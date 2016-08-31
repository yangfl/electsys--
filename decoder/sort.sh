#!/bin/bash
cd data
alpha=(a b c d e f g h i j k l m n o p q r s t u v w x y z)
if [ ! -d a ]; then
  for c in ${alpha[@]}; do
    mkdir $c
  done
else
  for c in ${alpha[@]}; do
    cd $c
    for f in *; do
      if [ ! ${f:0:1} = $c ]; then
        echo $c/$f wrong filename
        if [ ${f:0:1} = _ ]; then
          mv "$f" "$c$f"
        else
          mv "$f" "$c$(echo $f | cut -c2-)"
        fi
      fi
    done
    cd ..
  done
fi

for f in *.pbm; do
  x=$(gocr "$f" 2> /dev/null)
  x=${x,,}
  case $x in
    2 )
      x='z'
      ;;
    9 )
      x='g'
      ;;
  esac
  for c in ${alpha[@]}; do
    if [ a$x = a$c ]; then
      mv "$f" "$x/$x$f"
      break
    fi
  done
  if [ -f "$f" ]; then
    echo "$f" got "'"$x"'"
  fi
done
