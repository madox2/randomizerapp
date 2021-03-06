import React, {Component} from 'react'
import {Image, View, PanResponder, Animated, Easing} from 'react-native'
import {SectionTemplate} from '../components/SectionTemplate'
import {ResponsiveStyleSheet} from 'react-native-responsive-stylesheet'
import {resource} from '../utils/image'

const bottleSource = resource('images/bottle.png')

export class Bottle extends Component {
  constructor(...args) {
    super(...args)
    this.anim = new Animated.Value(0)
    this.rotation = Animated.modulo(this.anim, 360)
    this.onBottleLayout = this.onBottleLayout.bind(this)
  }

  computeAngle(x, y) {
    const PADDING_TOP = 0 // FIXME: how to handle absolute vs relative position?
    const mx = this.bottleLayout.x + this.bottleLayout.width / 2
    const my = this.bottleLayout.y + PADDING_TOP + this.bottleLayout.height / 2
    const dx = x - mx
    const dy = -(y - my)
    const rad = Math.atan2(dx, dy)
    return (rad * 180) / Math.PI
  }

  computeDirection(x, y, vx, vy) {
    const curr = this.computeAngle(x, y)
    const prev = this.computeAngle(x - vx, y - vy)
    return Math.sign(curr - prev)
  }

  computeVelocity(vx, vy) {
    return Math.sqrt(vx * vx + vy * vy)
  }

  startRotation(velocity, direction) {
    if (velocity < 0.1) {
      return
    }
    const duration = Math.sqrt(velocity) * 2500
    const spin = velocity * 5 // TODO: non linear function
    const newAngle = Math.floor(direction * 360 * spin)
    Animated.timing(this.anim, {
      toValue: newAngle,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }

  UNSAFE_componentWillMount() {
    this._panResponder = createPanResponder({
      onStart: (state) => {
        this.anim.setValue(this.computeAngle(state.x0, state.y0))
      },
      onMove: (state) => {
        this.anim.setValue(this.computeAngle(state.moveX, state.moveY))
      },
      onEnd: (state) => {
        const velocity = this.computeVelocity(state.vx, state.vy)
        const direction = this.computeDirection(
          state.moveX,
          state.moveY,
          state.vx,
          state.vy,
        )
        this.startRotation(velocity, direction)
      },
    })
  }

  onBottleLayout(l) {
    this.bottleLayout = l.nativeEvent.layout
  }

  render() {
    const s = makeStyles()
    return (
      <SectionTemplate {...this.props} title="Bottle">
        <View
          style={s.container}
          {...this._panResponder.panHandlers}
          collapsable={false}>
          <Animated.View
            onLayout={this.onBottleLayout}
            style={[
              {
                transform: [
                  {
                    rotate: this.rotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}>
            <Image source={bottleSource} style={s.image} />
          </Animated.View>
        </View>
      </SectionTemplate>
    )
  }
}

const makeStyles = ResponsiveStyleSheet.create(
  ({contentWidth, contentHeight}) => {
    const height = Math.min(contentWidth, contentHeight, 500)
    const width = height / 4
    return {
      image: {
        width,
        height,
      },
      container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }
  },
)

const createPanResponder = ({onStart, onMove, onEnd}) =>
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => true,
    onPanResponderGrant: (evt, state) => onStart(state),
    onPanResponderMove: (evt, state) => onMove(state),
    onPanResponderRelease: (evt, state) => onEnd(state),
  })
