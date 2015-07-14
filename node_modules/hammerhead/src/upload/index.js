import URL from 'url';
import FormData from './form-data';
import { fetchBody, respondWithJSON } from '../utils/http';

// Utils
function getFileInfo (contentTypeHeader, body, inputName, fileName) {
    var formData = new FormData();

    formData.parseContentTypeHeader(contentTypeHeader);
    formData.parseBody(body);


    var entry = formData.getEntriesByName(inputName)[0];
    var data  = Buffer.concat(entry.body);

    fileName = fileName.substr(fileName.lastIndexOf('\\') + 1);

    return {
        data: data.toString('base64'),
        info: {
            type: entry.headers['Content-Type'],
            name: fileName,
            size: data.length
        }
    };
}


// API
export function inject (contentTypeHeader, body) {
    var formData = new FormData();

    formData.parseContentTypeHeader(contentTypeHeader);

    if (!formData.boundary)
        return null;

    formData.parseBody(body);
    formData.expandUploads();

    return formData.toBuffer();
}

export async function ie9FileReaderShim (req, res) {
    var body              = await fetchBody(req);
    var parsedUrl         = URL.parse(req.url, true);
    var contentTypeHeader = req.headers['content-type'];
    var inputName         = parsedUrl.query['input-name'];
    var filename          = parsedUrl.query['filename'];
    var info              = getFileInfo(contentTypeHeader, body, inputName, filename);

    // NOTE: we should skip content type, because IE9 can't
    // handle content with content-type "application/json"
    // and trying to download it as a file
    respondWithJSON(res, info, true);
}

