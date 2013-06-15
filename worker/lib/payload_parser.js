function parse_payload(args, cb) {
    var fs = require('fs');
    var payloadIndex = -1;

    args.forEach(function (val, index, array) {
        if (val == "-payload") {
            payloadIndex = index + 1;
        }
    });

    if (payloadIndex == -1) {
        console.error("No payload argument");
        process.exit(1);
    }

    if (payloadIndex >= args.length) {
        console.error("No payload value");
        process.exit(1);
    }

    fs.readFile(args[payloadIndex], 'ascii', function (err, data) {
        if (err) {
            console.error("Could not open file: %s", err);
            process.exit(1);
        }
        cb(JSON.parse(data));
    });
}
module.exports.parse_payload = parse_payload;