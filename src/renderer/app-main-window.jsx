// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const React = require('react');
const { ipcRenderer } = require('electron');

export default class AppMainWindow extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    ipcRenderer.on('returnPlanList', (event, planList) => {
      console.log(planList);
    });
  }

  onSubmit() {
    const userNamesInput = document.getElementsByTagName('input');
    let inputValues = [];
    for(let i = 0; i < userNamesInput.length; i +=1){
      inputValues.push(userNamesInput[i].value);
    }
    ipcRenderer.send('input-msg', inputValues);
  }

  render() {
    let inputMap = [];
    for(let i = 0; i < 4; i += 1) {
      inputMap.push(
        <ul>
          <input />
          <br />
        </ul>
      );
    }
    return (
      <div>
        {inputMap}
        <button>+</button>
        <button onClick={this.onSubmit}>Submit</button>
      </div>
    );
  }
}
