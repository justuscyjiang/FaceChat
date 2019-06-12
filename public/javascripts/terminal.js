function terminal(msg) {
    var res = []
    msg = msg.replace(/\s*$/, "");
    if (pre != '> ') {
        switch (pre) {
            case "Input your new password: ":
                // TODO set pw to db
                res.push('Your password has been set successfully.')
                endInfo(res)
                pre = '> '
                document.querySelector('input').type = 'text'
                break
            case "Input your old password: ":
                // TODO check ole pw to db
                if (msg == '190613') {
                    res.push('Input your new password: ')
                    whileInfo(res)
                    pre = 'Input your new password: '
                } else {
                    res.push('Your password is incorrect.')
                    endInfo(res)
                    pre = '> '
                    document.querySelector('input').type = 'text'
                }
                break

        }
        return
    }
    pre = '> '

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
            case 'password':
                if (account == 'spy') { // TODO check if password exists already

                    res.push(msg, 'Input your old password: ')
                    inputInfo(res)
                    pre = 'Input your old password: '
                    document.querySelector('input').type = 'password'

                } else {
                    res.push(msg, 'Input your new password: ')
                    inputInfo(res)
                    pre = 'Input your new password: '
                    document.querySelector('input').type = 'password'
                }
                break
            case 'help':
            default:
                res.push(msg, `<table style="width:100%" id='help'><tbody >
            <tr>
              <td>block &ltusername&gt</td>
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
              <td>password</td>
              <td>Set password to your account.</td>
            </tr>
            <tr>
              <td>unblock &ltusername&gt</td>
              <td>Unblock the call from someone.</td>
            </tr>
            <tr>
              <td>version</td>
              <td>See the information about this website.</td>
            </tr>
            <tr>
              <td>width &ltpx&gt</td>
              <td>Adjust the width of the video.</td>
            </tr>
            </tbody>
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
            case 'unblock':
                socket.emit('notice', msg.split(" ")[1] + "^" + 'unblock')
                res.push(msg, 'You have unblocked the call from ' + msg.split(" ")[1] + ' successfully.')
                appendTerminal(res)
                break
            case 'width':
                document.getElementById('canvasOutput').setAttribute('style', 'width: ' + msg.split(" ")[1] + 'px;')
                res.push(msg, 'The width of the video has been set to ' + msg.split(" ")[1] + 'px successfully.')
                appendTerminal(res)
                break


        }
    }
}

var pre = '> '
var source = ''

function key() {
    var item = document.querySelector('.speeches').lastChild;
    source = document.querySelector('input').value
    if (pre == 'Input your new password: ' || pre == 'Input your old password: ') {
        pw = ''
        for (var i = 0; i < source.length; i++) {
            pw = pw.concat('*')
        }
        source = pw
    }
    var textnode = document.createTextNode(pre + source);
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

function inputInfo(res) {
    let el = document.querySelector('.speeches');
    el.removeChild(el.lastChild);
    let html = el.innerHTML;
    html +=
        `
    <div style="font-size:16px; font-family:Monaco">> ${res[0]}</div>
    <div style="font-size:16px; font-family:Monaco">${res[1]}</div>
    `;

    el.innerHTML = html.trim();
    scrollWindow();
}

function whileInfo(res) {
    let el = document.querySelector('.speeches');

    let html = el.innerHTML;
    html +=
        `
    <div style="font-size:16px; font-family:Monaco">${res}</div>
    `;

    el.innerHTML = html.trim();
    scrollWindow();
}

function endInfo(res) {
    let el = document.querySelector('.speeches');
    let html = el.innerHTML;
    html +=
        `
    <div style="font-size:16px; font-family:Monaco">${res}</div><br>
    <div style="font-size:16px; font-family:Monaco">></div>
    `;

    el.innerHTML = html.trim();
    scrollWindow();
}