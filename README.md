# LBRY Archive

LBRY Archive is a web application that allows users to archive web pages, including all their CSS and images, in MHTML format and upload them to the LBRY network. The program is designed to help preserve web content and make it accessible on the decentralized LBRY network.

## Features

* Archives web pages in MHTML format
* Uploads the archive file and a preview image to the LBRY network
* Responsive web interface with a spinning wheel during archiving process
* Rate limiting to prevent abuse and DDOS attacks

## Requirements

* Node.js (v16 or higher)
* LBRY client
* LBRY SDK

## Installation

1. Clone this repository:

```
git clone https://github.com/yourusername/lbry-archive.git
cd lbry-archive
```

2. Install the dependencies:
```
npm install
```

3. Configure the LBRY client:
```
lbrynet-cli account create
lbrynet-cli wallet new_address
```
4. Start the LBRY client:
```markdown
lbrynet start
```
5. Start the web application:
```
npm start
```
6. Access the application in your web browser at `http://localhost:3000`.

## Usage

1. Enter a web URL into the input field on the home page and click "Archive".
2. Wait for the archiving process to complete (a spinning wheel will indicate the progress).
3. Once the process is complete, the filename of the uploaded archive file will be displayed on the page.
4. You can view the uploaded archive on the LBRY network by visiting the URL `http://lbry.tv/{filename}`, where `{filename}` is the name of the archived file.

## Limitations

* Large web pages may exceed the maximum size limit of the LBRY network (currently 400 MB).
* Certain web pages may not be archivable due to security restrictions or technical limitations.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
