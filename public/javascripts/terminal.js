function terminal(msg) {
    var res = []
    switch (msg) {


        case 'version':
            res.push(msg, 'FaceChat 2019-06-11 <br>Adelaide Hsu, Vivi Hsu, Justus Jiang')
            appendTerminal(res)
            break
        case 'exit':
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
            // document.querySelector("input").removeEventListener("keyup", key);
            break
        case 'help':

        default:
            res.push(msg, `<table style="width:100%">
            <tr>
              <td>block</td>
              <td>TBD.</td>
            </tr>
            <tr>
              <td>exit</td>
              <td>Return to chatroom.</td>
            </tr>
            <tr>
              <td>help</td>
              <td>See all commands.</td>
            </tr>
              <tr>
              <td>version</td>
              <td>See the information about this website.</td>
            </tr>
          </table>`)
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