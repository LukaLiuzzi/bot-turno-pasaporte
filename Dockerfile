FROM --platform=linux/arm64 node:20-slim

# Update the package lists and install dependencies required for Playwright
RUN apt-get update && apt-get install -y \
    libwoff1 \
    libopus0 \
    libwebp7 \
    libwebpdemux2 \
    libenchant-2-2 \
    libgudev-1.0-0 \
    libsecret-1-0 \
    libhyphen0 \
    libgdk-pixbuf2.0-0 \
    libegl1 \
    libnotify4 \
    libxslt1.1 \
    libevent-2.1-7 \
    libgles2 \
    libvpx7 \
    libxcomposite1 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libepoxy0 \
    libgtk-3-0 \
    libharfbuzz-icu0 \
    libgstreamer-gl1.0-0 \
    libgstreamer-plugins-bad1.0-0 \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    # Additional dependencies for chromium
    libnss3 \
    libxss1 \
    libasound2 \
    fonts-noto-color-emoji \
    wget \
    xvfb \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Playwright with specific configuration for ARM64
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npx playwright install-deps chromium
RUN npx playwright install chromium

# Copy the rest of the application
COPY . .

# Set display for Xvfb
ENV DISPLAY=:99

# Create an entrypoint script
RUN echo '#!/bin/sh\nXvfb :99 -screen 0 1024x768x16 &\nnpm start' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]