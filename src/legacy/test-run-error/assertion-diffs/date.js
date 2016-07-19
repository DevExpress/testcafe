import moment from 'moment';

function formatDateTime (date) {
    return moment(date).format('ddd MMM DD YYYY hh:mm:ss.SSS [GMT]ZZ');
}

export default function getDatesDiff (err) {
    return {
        expected: formatDateTime(err.expected),
        actual:   formatDateTime(err.actual),
        marker:   ''
    };
}
