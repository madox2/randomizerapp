import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View} from 'react-native'
import {UserOptions} from './UserOptions'
import {ControlButton} from './ControlButton'
import {ResponsiveStyleSheet} from 'react-native-responsive-stylesheet'
import {Info} from './Info'

export class SectionTemplate extends Component {
  constructor(...args) {
    super(...args)
    this.back = this.back.bind(this)
    this.onSettings = this.onSettings.bind(this)
  }

  render() {
    const {
      children,
      onRefresh,
      options,
      onOptionsChange,
      style,
      color,
      buttonColor,
      type,
    } = this.props
    const displayBack = this.props.onBack || this.context.back
    const s = makeStyles()
    return (
      <View style={[s.container, {backgroundColor: color}]}>
        <View style={[s.content, style]}>{children}</View>
        <View style={s.controlButtonContainerLeft}>
          {displayBack && (
            <ControlButton
              onPress={this.back}
              type="back"
              backgroundColor={buttonColor}
            />
          )}
        </View>
        <View style={s.controlButtonContainerCenter}>
          {onRefresh && (
            <ControlButton
              onPress={onRefresh}
              type="refresh"
              backgroundColor={buttonColor}
            />
          )}
        </View>
        <View style={s.controlButtonContainerRight}>
          {options && (
            <ControlButton
              onPress={this.onSettings}
              type="settings"
              backgroundColor={buttonColor}
            />
          )}
        </View>
        <View style={s.infoContainer}>
          <Info type={type} buttonColor={buttonColor} />
        </View>
        {options && (
          <View style={s.options}>
            <UserOptions
              ref={(r) => (this.options = r)}
              options={options}
              onChange={onOptionsChange}
            />
          </View>
        )}
      </View>
    )
  }

  onSettings() {
    this.options.change()
    this.props.onSettings && this.props.onSettings()
  }

  back() {
    this.context.back && this.context.back()
    this.props.onBack && this.props.onBack()
  }
}

SectionTemplate.propTypes = {
  onBack: PropTypes.func,
  onRefresh: PropTypes.func,
  onSettings: PropTypes.func,
  options: PropTypes.object,
  onOptionsChange: PropTypes.func,
  title: PropTypes.string,
  color: PropTypes.string,
  infoText: PropTypes.string,
}

SectionTemplate.contextTypes = {
  back: PropTypes.func,
}

const makeStyles = ResponsiveStyleSheet.create(
  ({width, contentPadding, controlButtonSize}) => {
    const controlsButtonContainer = {
      justifyContent: 'center',
      position: 'absolute',
      bottom: contentPadding,
    }
    return {
      container: {
        flex: 1,
      },
      controlButtonContainerLeft: {
        ...controlsButtonContainer,
        left: contentPadding,
      },
      controlButtonContainerCenter: {
        ...controlsButtonContainer,
        left: width / 2 - controlButtonSize / 2,
      },
      controlButtonContainerRight: {
        ...controlsButtonContainer,
        left: width - contentPadding - controlButtonSize,
      },
      content: {
        flex: 1,
      },
      options: {
        position: 'absolute',
        top: 0,
        left: 0,
      },
      infoContainer: {
        position: 'absolute',
        padding: contentPadding / 2,
        top: 0,
        right: 0,
      },
    }
  },
)
