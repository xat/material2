import {
  Component,
  ViewEncapsulation,
  Input,
  HostBinding,
  HostListener,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer,
} from 'angular2/core';
import {TimerWrapper} from 'angular2/src/facade/async';

// TODO(jelbourn): Ink ripples.
// TODO(jelbourn): Make the `isMouseDown` stuff done with one global listener.
// TODO(kara): Convert attribute selectors to classes when attr maps become available


@Component({
  selector: '[md-button]:not(a), [md-raised-button]:not(a), [md-icon-button]:not(a), ' +
            '[md-fab]:not(a), [md-mini-fab]:not(a)',
  inputs: ['color'],
  host: {
    '[class.md-button-focus]': 'isKeyboardFocused',
    '(mousedown)': 'setMousedown()',
    '(focus)': 'setKeyboardFocus()',
    '(blur)': 'removeKeyboardFocus()'
  },
  templateUrl: './components/button/button.html',
  styleUrls: ['./components/button/button.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdButton {
  private _color: string;

  /** Whether the button has focus from the keyboard (not the mouse). Used for class binding. */
  isKeyboardFocused: boolean = false;

  /** Whether a mousedown has occurred on this element in the last 100ms. */
  isMouseDown: boolean = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer) { }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }

  setMousedown() {
    // We only *show* the focus style when focus has come to the button via the keyboard.
    // The Material Design spec is silent on this topic, and without doing this, the
    // button continues to look :active after clicking.
    // @see http://marcysutton.com/button-focus-hell/
    this.isMouseDown = true;
    TimerWrapper.setTimeout(() => { this.isMouseDown = false; }, 100);
  }

  _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this.renderer.setElementClass(this.elementRef.nativeElement, `md-${color}`, isAdd);
    }
  }

  setKeyboardFocus($event: any) {
    this.isKeyboardFocused = !this.isMouseDown;
  }

  removeKeyboardFocus() {
    this.isKeyboardFocused = false;
  }
}

@Component({
  selector: 'a[md-button], a[md-raised-button], a[md-icon-button], a[md-fab], a[md-mini-fab]',
  inputs: ['color'],
  host: {
    '[class.md-button-focus]': 'isKeyboardFocused',
    '(mousedown)': 'setMousedown()',
    '(focus)': 'setKeyboardFocus()',
    '(blur)': 'removeKeyboardFocus()'
  },
  templateUrl: './components/button/button.html',
  styleUrls: ['./components/button/button.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdAnchor extends MdButton {
  _disabled: boolean = null;

  constructor(elementRef: ElementRef, renderer: Renderer) {
    super(elementRef, renderer);
  }

  @HostBinding('tabIndex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  @HostBinding('attr.aria-disabled')
  /** Gets the aria-disabled value for the component, which must be a string for Dart. */
  get isAriaDisabled(): string {
    return this.disabled ? 'true' : 'false';
  }

  @HostBinding('attr.disabled')
  @Input('disabled')
  get disabled() { return this._disabled; }

  set disabled(value: boolean) {
    // The presence of *any* disabled value makes the component disabled, *except* for false.
    this._disabled = (value != null && value != false) ? true : null;
  }

  @HostListener('click', ['$event'])
  haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
