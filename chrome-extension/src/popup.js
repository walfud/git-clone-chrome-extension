import React, { Component } from "react"
import ReactDOM from "react-dom"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"

class App extends Component {
  state = {
    url: '',
    targets: [],

    addPatternValue: "",
    addLocalDirValue: "",
    addProtocolValue: "https",

    err: ""
  }
  refAddBtn = null
  refAddPattern = null
  refAddLocalDir = null
  refAddProtocol = null
  background = chrome.extension.getBackgroundPage()

  constructor() {
    super()

    ;(async () => {
      try {
        this.setState({
          url: (await this.background.getUrl()) || '',
          targets: (await this.background.retrieve()) || [],
        })
      } catch (err) {
        console.log(err.message)
      }
    })()
  }

  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            width: 360
          }}
        >
          {this.renderAuto()}

          {this.renderTargetList()}

          {this.renderAdd()}

          {this.state.err && <label>{this.state.err}</label>}
        </div>
      </DragDropContext>
    )
  }

  onDragEnd = (result, provided) => {
    const { source, destination } = result
    if (!source || !destination) {
      return
    }
    const fromIndex = source.index
    const toIndex = destination.index
    if (
      fromIndex >= this.state.targets.length ||
      toIndex >= this.state.targets.length
    ) {
      console.error("onDragEnd: drag index out of bound")
      return
    }

    // Reorder
    const newTargets = this.state.targets.filter((_, i) => i !== fromIndex)
    const fromTarget = this.state.targets[fromIndex]
    newTargets.splice(toIndex, 0, fromTarget)
    this.setState({
      targets: newTargets
    }, async () => {
      // Persistense
      try {
        await this.background.save(newTargets)
        this.setState({
          err: "saved!"
        })
      } catch (err) {
        this.setState({
          err: err.message,
        })
      }
    })
  }

  onClickAuto = event => {
    console.log("auto")
  }
  renderAuto() {
    for (let i of this.state.targets) {
      if (this.state.url.match(i.pattern)) {
        return (
          <button ref={r => this.refAddBtn = r} onClick={this.onClickAuto}>{`Auto: ${i.target}`}</button>
        )
      }
    }

    return (
      <button ref={r => this.refAddBtn = r} disabled={true}>I don't know...</button>
    )
  }

  onChangeAddPattern = event => {
    this.setState({
      addPatternValue: event.target.value
    })
  }
  onChangeAddLocalDir = event => {
    this.setState({
      addLocalDirValue: event.target.value
    })
  }
  onChangeAddProtocol = event => {
    this.setState({
      addProtocolValue: event.target.value
    })
  }
  onAdd = event => {
    if (!this.state.addPatternValue) {
      this.setState(
        {
          err: "Pattern?"
        },
        () => {
          this.refAddPattern && this.refAddPattern.focus()
        }
      )
      return
    }
    try {
      new RegExp(this.state.addPatternValue)
    } catch (err) {
      this.setState(
        {
          err: `Pattern: ${err.message}`
        },
        () => {
          this.refAddPattern && this.refAddPattern.select()
        }
      )
      return
    }
    if (!this.state.addLocalDirValue) {
      this.setState(
        {
          err: "Local Directory?"
        },
        () => {
          this.refAddLocalDir && this.refAddLocalDir.focus()
        }
      )
      return
    }

    this.setState({
      targets: [
        ...this.state.targets,
        {
          pattern: this.state.addPatternValue,
          localDir: this.state.addLocalDirValue,
          protocol: this.state.addProtocolValue
        }
      ]
    })

    // Reset
    this.setState(
      {
        addPatternValue: "",
        addLocalDirValue: "",
        addProtocolValue: "",

        err: ""
      },
      () => {
        this.refAddPattern && this.refAddPattern.focus()
      }
    )
  }
  renderAdd() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row"
        }}
      >
        <input
          onChange={this.onChangeAddPattern}
          value={this.state.addPatternValue}
          placeholder="^http(s)?://github.com/walfud/[^/]+"
          ref={r => (this.refAddPattern = r)}
        />
        ->
        <input
          onChange={this.onChangeAddLocalDir}
          value={this.state.addLocalDirValue}
          placeholder="$Projects"
          ref={r => (this.refAddLocalDir = r)}
        />
        <select
          value={this.state.addProtocolValue}
          onChange={this.onChangeAddProtocol}
          ref={r => (this.refAddProtocol = r)}
        >
          <option value="https">https</option>
          <option value="ssh">ssh</option>
        </select>
        <button onClick={this.onAdd}>✅</button>
      </div>
    )
  }

  onTargetClick(target) {
    console.log(target)
  }
  renderTargetItem(target) {
    return (
      <label onClick={_ => this.onTargetClick(target)}>{target.localDir}</label>
    )
  }
  renderTargetList() {
    const draggables = this.state.targets.map((x, i) => (
      <Draggable draggableId={i} index={i} key={JSON.stringify(x)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {this.renderTargetItem(x)}
          </div>
        )}
      </Draggable>
    ))
    return (
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column"
            }}
            ref={provided.innerRef}
          >
            {draggables}
          </div>
        )}
      </Droppable>
    )
  }
}

ReactDOM.render(<App />, document.getElementById("root"))