function terminal(msg) {
    var res = []
    msg = msg.replace(/\s*$/, "");
    if (msg.split(" ").length == 1) {
        switch (msg) {
            case 'version':
                res.push(msg, 'FaceChat 2019-06-11 <br>Adelaide Hsu, Vivi Hsu, Justus Jiang')
                appendTerminal(res)
                break
            case 'exit':
                config = false
                document.querySelector('.speeches').innerHTML = '';
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
                res.push(msg, `<table style="width:100%" id='help'><tbody >
            <tr>
              <td>block \<username\></td>
              <td>Block the call from someone.</td>
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
            </tr></tbody>
          </table>`)
                appendTerminal(res)
                break
        }
    } else {
        switch (msg.split(" ")[0]) {
            case 'block':
                socket.emit('notice', msg.split(" ")[1] + "^" + 'block')
                res.push(msg, 'You have blocked the call from ' + msg.split(" ")[1] + ' successfully.')
                appendTerminal(res)
                break

        }
    }
}



function key() {
    var textnode = document.createTextNode("> " + document.querySelector('input').value);
    var item = document.querySelector('.speeches').lastChild;
    item.replaceChild(textnode, item.lastChild);
}

function appendTerminal(res) {
    let el = document.querySelector('.speeches');
    el.removeChild(el.lastChild);
    let html = el.innerHTML;
    html +=
        `
    <div style="font-size:16px; font-family:Monaco">> ${res[0]}</div>
    <div style="font-size:16px; font-family:Monaco">${res[1]}</div><br>
    <div style="font-size:16px; font-family:Monaco">></div>
    `;

    el.innerHTML = html.trim();
    scrollWindow();

}