#!/bin/bash
README="README.md"
TEMP="README_temp.md"

sed -n '1,/<!-- INICIO TABLA COMMITS -->/p' $README > $TEMP

echo "" >> $TEMP
echo "| # | Fecha | Hash | Mensaje | Zona | Cambio |" >> $TEMP
echo "|---|---|---|---|---|---|" >> $TEMP

git log --reverse --date=short --pretty=format:"%ad|%h|%s" \
  | nl -w1 -s'@' \
  | awk -F'@' '{
      n = split($2, fields, " *[|] *");
      num = $1;
      date_val = fields[1];
      hash_val = fields[2];
      msg = fields[3];
      zona = (fields[4] != "") ? fields[4] : "";
      cambio = (fields[5] != "") ? fields[5] : "";
      print "| " num " | " date_val " | " hash_val " | " msg " | " zona " | " cambio " |";
    }' >> $TEMP

echo "" >> $TEMP

sed -n '/<!-- FIN TABLA COMMITS -->/,$p' $README >> $TEMP
mv $TEMP $README