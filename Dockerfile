ROM node:18-slim

RUN apt-get update \
    && apt-get install -yq libgbm-dev gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    ca-certificates fonts-liberation  libnss3 lsb-release xdg-utils wget \
    xvfb x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app
COPY package*.json ./
COPY puppeteer.config* ./
RUN npm install
COPY . .


# Run everything as non-privileged user.
# Add user so we don't need --no-sandbox.
# same layer as npm install to keep re-chowned files from using up several hundred MBs more space \
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser --home-dir /app \
    && mkdir -p /app/.cache/puppeteer \
    && chown -R pptruser:pptruser /app

RUN mkdir /usr/local/sbin/chrome-devel-sandbox \
    && chown root:root /usr/local/sbin/chrome-devel-sandbox \
    && chmod 4755 /usr/local/sbin/chrome-devel-sandbox
ENV CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
USER pptruser
EXPOSE 3100
CMD ["npm", "start"]
