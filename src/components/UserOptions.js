import React, { PropTypes, Component } from 'react'
import { View, Text, TouchableHighlight } from 'react-native'
import { InputNumber } from './InputNumber'
import { InputText } from './InputText'
import { validateNumber, validateText } from '../utils/validation'

const mapObject = (obj, fn) => Object.keys(obj).map(k => fn([ k, obj[k] ]))

const reduceProperties = (obj, fn) => Object.keys(obj).reduce((r, k) => ({
  ...r,
  [k]: fn(obj[k], k),
}), {})

export const Button = ({ children, onPress }) => (
  <TouchableHighlight onPress={onPress}>
    <Text>{children}</Text>
  </TouchableHighlight>
)

const inputs = {
  number: InputNumber,
  text: InputText,
}

const validations = {
  number: validateNumber,
  text: validateText,
}

const validate = options => {
  let _valid = true
  const _options = reduceProperties(options, (o) => {
    const validator = validations[o.type]
    if (validator) {
      const { valid, err } = validator(o.value, o.constraints)
      if (!valid) {
        _valid = false
        return { ...o, err }
      }
    }
    const { err, ...opt } = o // eslint-disable-line
    return opt
  })
  return { valid: _valid, options: _options }
}

export class UserOptions extends Component {

  constructor(...props) {
    super(...props)
    this.change = this.change.bind(this)
    this.cancel = this.cancel.bind(this)
    this.save = this.save.bind(this)
    const options = reduceProperties(this.props.options, obj => ({
      ...obj, value: obj.defaultValue,
    }))
    this.state = { editMode: false, options }
  }

  render() {
    const { editMode } = this.state
    const summary = this.makeSummary()
    return editMode ? (
      <View>
        {this.makeInputs()}
        <Button onPress={this.cancel}>Cancel</Button>
        <Button onPress={this.save}>Save</Button>
      </View>
    ) : (
      <View>
        {summary}
        <Button onPress={this.change}>Change</Button>
      </View>
    )
  }

  change() {
    this.setState({
      editMode: true,
      editOptions: this.state.options,
    })
  }

  cancel() {
    this.setState({
      editMode: false,
      editOptions: null,
    })
  }

  save() {
    const { valid, options } = validate(this.state.editOptions)
    if (!valid) {
      this.setState({ editOptions: options })
      return
    }
    this.props.onChange(this.state.editOptions)
    this.setState({
      editMode: false,
      editOptions: null,
      options: this.state.editOptions,
    })
  }

  onInputChange(key, value) {
    const { editOptions } = this.state
    this.setState({
      editOptions: {
        ...editOptions,
        [key]: { ...editOptions[key], value },
      },
    })
  }

  makeInputs() {
    return mapObject(this.state.editOptions, ([ key, obj ]) => {
      const Input = inputs[obj.type]
      const onInputChange = this.onInputChange.bind(this, key)
      return (
        <Input
          key={key}
          value={obj.value}
          label={obj.label}
          error={obj.err}
          onChange={onInputChange}
        />
      )
    })
  }

  makeSummary() {
    return mapObject(this.state.options, ([ key, obj ]) => {
      const text = `${obj.label}: ${obj.value}`
      return (
        <Text key={key}>{text}</Text>
      )
    })
  }

}

UserOptions.propTypes = {
  options: PropTypes.object,
  onChange: PropTypes.func,
}

UserOptions.defaultProps = {
  options: {},
  onChange: () => 0,
}