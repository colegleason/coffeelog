jekyll build
s3cmd sync --cf-invalidate --delete-removed _site/ s3://coffee.colegleason.com/
