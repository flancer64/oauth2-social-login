import https from 'https';
import querystring from 'querystring';

/**
 * Helper class for performing web requests in this plugin.
 */
export default class Fl64_OAuth2_Social_Back_Helper_Web {
    /**
     * Constructor for the web helper.
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     */
    constructor({TeqFw_Core_Shared_Api_Logger$$: logger}) {
        // VARS

        // FUNCS
        /**
         * Makes an HTTP request.
         * @param {Object} params - Request parameters.
         * @param {string} params.hostname - The hostname of the server.
         * @param {string} params.path - The path of the resource.
         * @param {string} params.method - The HTTP method (e.g., 'GET', 'POST').
         * @param {Object} [params.body] - The request body (for POST requests).
         * @param {Object} params.headers - Headers to include in the request.
         * @param {number} params.timeout - Timeout in milliseconds.
         * @returns {Promise<Object>} - Resolves to the parsed JSON response.
         */
        function makeRequest({hostname, path, method, body = null, headers, timeout}) {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname,
                    path,
                    method,
                    headers,
                };

                logger.info(`Sending ${method} request to ${hostname}${path}`);

                const req = https.request(options, (res) => {
                    let data = '';

                    // Collect response data
                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    // Handle end of response
                    res.on('end', () => {
                        if (res.statusCode < 200 || res.statusCode >= 300) {
                            logger.error(`HTTP Error: ${res.statusCode}, Response: ${data}`);
                            return reject(new Error(`HTTP Error: ${res.statusCode}`));
                        }
                        try {
                            const jsonResponse = JSON.parse(data);
                            resolve(jsonResponse);
                        } catch (error) {
                            reject(new Error(`Failed to parse response: ${error.message}`));
                        }
                    });
                });

                // Handle request errors
                req.on('error', (error) => {
                    logger.error(`Request failed: ${error.message}`);
                    reject(new Error(`Request failed: ${error.message}`));
                });

                // Handle timeout
                req.setTimeout(timeout, () => {
                    req.destroy(new Error('Request timed out'));
                });

                // Send the request body for POST
                if (body) {
                    req.write(body);
                }

                req.end();
            });
        }

        // MAIN
        /**
         * Performs a POST request.
         * @param {Object} params - Parameters for the POST request.
         * @param {string} params.hostname - The hostname of the server.
         * @param {string} params.path - The path of the resource.
         * @param {Object} params.payload - The data to send in the request body.
         * @param {Object} params.headers - Headers to include in the request.
         * @param {number} [params.timeout=5000] - Timeout in milliseconds.
         * @returns {Promise<Object>} - Resolves to the parsed JSON response.
         */
        this.post = async function ({hostname, path, payload, headers, timeout = 5000}) {
            const postData = headers['Content-Type'] === 'application/json'
                ? JSON.stringify(payload)
                : querystring.stringify(payload);

            return makeRequest({
                hostname,
                path,
                method: 'POST',
                body: postData,
                headers: {
                    ...headers,
                    'Content-Length': Buffer.byteLength(postData),
                },
                timeout,
            });
        };

        /**
         * Performs a GET request.
         * @param {Object} params - Parameters for the GET request.
         * @param {string} params.hostname - The hostname of the server.
         * @param {string} params.path - The path of the resource.
         * @param {Object} params.headers - Headers to include in the request.
         * @param {number} [params.timeout=5000] - Timeout in milliseconds.
         * @returns {Promise<Object>} - Resolves to the parsed JSON response.
         */
        this.get = async function ({hostname, path, headers, timeout = 5000}) {
            return makeRequest({
                hostname,
                path,
                method: 'GET',
                headers,
                timeout,
            });
        };
    }
}
