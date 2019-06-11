function terminal(msg) {
    var res = []
    switch (msg) {


        case 'version':
            res.push(msg, 'FaceChat 2019-06-11 <br>Adelaide Hsu, Vivi Hsu, Justus Jiang')
            appendTerminal(res)
            break
        case 'end':
            config = false
            socket.on('message', (obj) => {
                appendData([obj]);
            });

            socket.on('messageP', (obj) => {
                appendDataP([obj]);
            });
            if (!privateMessages) {
                socket.emit('history');
            } else {
                socket.emit('historyP')
            }
            document.querySelector("input").removeEventListener("keyup", key);
            break
        case 'help':

        default:
            res.push(msg, `block            TBD<br>end          Exit.<br>
            help         See all commands.<br>version         See the information about this website.`)
            appendTerminal(res)
            break
    }
}



function key() {
    let el = document.querySelector('.speeches');
    el.removeChild(el.lastChild);
    let html = el.innerHTML;
    html += `<div style="font-size:16px; font-family:Monaco">> ${document.querySelector('input').value }</div>`
}

function appendTerminal(res) {
    let el = document.querySelector('.speeches');
    el.removeChild(el.lastChild);
    let html = el.innerHTML;
    html +=
        `
    <div style="font-size:16px; font-family:Monaco">> ${res[0]}</div>
    <div style="font-size:16px; font-family:Monaco">${res[1]}</div><br>
    <div style="font-size:16px, font-family:Monaco">></div>
    `;

    el.innerHTML = html.trim();
    scrollWindow();

}