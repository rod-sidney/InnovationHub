#!/bin/bash
README="README.md"
TEMP="README_temp.md"

sed -n '1,/<!-- INICIO TABLA COMMITS -->/p' $README > $TEMP

# Tabla
echo "" >> $TEMP
echo "| # | Fecha | Hash | Mensaje | Zona | Cambio |" >> $TEMP
echo "|---|---|---|---|---|---|" >> $TEMP

# separa ultimas 3 columnas
git log --reverse --date=short --pretty=format:"%ad|%h|%s" \
  | nl -w1 -s'|' \
  | awk -F'|' '{
      # Divide el mensaje del commit si contiene separadores
      n = split($4, parts, " \\| ");
      msg = (parts[1] != "") ? parts[1] : "";
      zona = (parts[2] != "") ? parts[2] : "";
      cambio = (parts[3] != "") ? parts[3] : "";
      print "| " $1 " | " $2 " | " $3 " | " msg " | " zona " | " cambio " |";
    }' >> $TEMP

echo "" >> $TEMP

sed -n '/<!-- FIN TABLA COMMITS -->/,$p' $README >> $TEMP
mv $TEMP $README