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

      ; (async () => {
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
          err: "reorder: saved!"
        })
      } catch (err) {
        this.setState({
          err: err.message,
        })
      }
    })
  }

  renderAuto() {
    for (let i of this.state.targets) {
      if (this.state.url.match(i.pattern)) {
        return (
          <button ref={r => this.refAddBtn = r} onClick={() => this.background.runNativeGit(this.state.url, i.localDir)}>{`Auto: ${i.localDir}`}</button>
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
  onAdd = async event => {
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

    // Persistense
    try {
      const newTargets = [
        ...this.state.targets,
        {
          pattern: this.state.addPatternValue,
          localDir: this.state.addLocalDirValue,
          protocol: this.state.addProtocolValue,
        },
      ]
      await this.background.save(newTargets)
      this.setState({
        targets: newTargets,
        err: "add: saved!",
      })

      // Reset
      this.setState({
        addPatternValue: "",
        addLocalDirValue: "",
        addProtocolValue: "",
      }, () => {
        this.refAddPattern && this.refAddPattern.focus()
      })
    } catch (err) {
      this.setState({
        err: err.message,
      })
    }
  }
  onDel = async target => {
    // Persistense
    try {
      const newTargets = this.state.targets.filter(x => x !== target)
      await this.background.save(newTargets)
      this.setState({
        targets: newTargets,
        err: "del: saved!",
      })
    } catch (err) {
      this.setState({
        err: err.message,
      })
    }
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
      <div style={{
        flex: 1,
        flex: 'row',
        justifyContent: 'space-between',
      }}>
      <button onClick={_ => this.onDel(target)}>移除</button>
        <label onClick={_ => this.onTargetClick(target)}>{target.localDir}</label>
        <button onClick={_ => this.background.runNativeGit(this.state.url, target.localDir)}>clone</button>
      </div>
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