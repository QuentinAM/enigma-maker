export function FormatDate(date: string): string
{
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    // Two digit for values with only one
    const hoursStr = hours < 10 ? '0' + hours : hours;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const secondsStr = seconds < 10 ? '0' + seconds : seconds;
    const dayStr = day < 10 ? '0' + day : day;
    const monthStr = month < 10 ? '0' + month : month;

    return `${dayStr}/${monthStr}/${year} ${hoursStr}:${minutesStr}:${secondsStr}`;
}

export function FormatDescription(description: string): string | null
{
    if (description == null)
    {
        return null;
    }

    // Replace links with <a> tags
    const regex = /((http|https):\/\/[^\s]+)/g;
    const result = description.replace(regex, (url) => {
        return `<a class="link text-blue-500" href="${url}" target="_blank">${url}</a>`;
    });

    // Replace new lines with <br> tags
    return result.replace(/\n/g, "<br>");
}