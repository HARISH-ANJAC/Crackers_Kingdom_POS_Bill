export const types = {
    allFiles: '*/*',
    audio: 'audio/*',
    csv: ['text/csv', 'text/comma-separated-values'],
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    images: 'image/*',
    pdf: 'application/pdf',
    plainText: 'text/plain',
    json: 'application/json',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    video: 'video/*',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
};

export const errorCodes = {
    OPERATION_CANCELED: 'OPERATION_CANCELED',
    IN_PROGRESS: 'ASYNC_OP_IN_PROGRESS',
    UNABLE_TO_OPEN_FILE_TYPE: 'UNABLE_TO_OPEN_FILE_TYPE',
    NULL_PRESENTER: 'NULL_PRESENTER',
};

export const isErrorWithCode = (error) => {
    return error && typeof error === 'object' && 'code' in error;
};

export const pick = async (options) => {
    return new Promise((resolve, reject) => {
        // Basic web implementation using input type="file"
        const input = document.createElement('input');
        input.type = 'file';

        if (options && options.type) {
            const acceptTypes = Array.isArray(options.type) ? options.type.flat().join(',') : options.type;
            input.accept = acceptTypes;
        }

        if (options && options.allowMultiSelection) {
            input.multiple = true;
        }

        const handleCancel = () => {
            window.removeEventListener('focus', handleCancel);
            // Timeout to allow potential change event to fire first
            setTimeout(() => {
                if (!input.files || input.files.length === 0) {
                    reject({ code: errorCodes.OPERATION_CANCELED, message: 'User canceled' });
                }
            }, 300);
        };

        input.onchange = (e) => {
            window.removeEventListener('focus', handleCancel);
            const files = e.target.files;
            if (!files || files.length === 0) {
                reject({ code: errorCodes.OPERATION_CANCELED, message: 'User canceled' });
                return;
            }

            const results = Array.from(files).map(file => ({
                uri: URL.createObjectURL(file), // Note: This URI is web-only
                name: file.name,
                type: file.type,
                size: file.size,
                hasRequestedType: true
            }));
            resolve(results);
        };

        // Note: oncancel is not widely supported, using focus trick as fallback
        window.addEventListener('focus', handleCancel);
        input.click();
    });
};

export const pickDirectory = async () => {
    throw new Error('pickDirectory is not supported on web');
};

export const saveDocuments = async () => {
    throw new Error('saveDocuments is not supported on web');
};

export const keepLocalCopy = async (options) => {
    // On web, we might just return the original result or a blob
    return options.files.map(file => ({
        status: 'success',
        localUri: file.uri
    }));
};

export const isKnownType = async () => true;
export const releaseLongTermAccess = () => { };
export const releaseSecureAccess = () => { };
