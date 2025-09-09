FROM nginx:1.27-alpine

# Copia configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o site estático
COPY index.html /usr/share/nginx/html/index.html
COPY faq.html /usr/share/nginx/html/faq.html
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY templates/ /usr/share/nginx/html/templates/

# Exponha a porta padrão do Nginx
EXPOSE 80

# Healthcheck simples via curl (imagem não possui curl por padrão; mantido para orquestradores externos)
