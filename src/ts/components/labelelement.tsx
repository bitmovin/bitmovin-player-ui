import { h, Component } from "preact";

export interface LabelProps {
  id: string;
  cssClass: string;
  text: string;
  onClick: () => void;
}

export interface LabelState {
  id: string;
  cssClass: string;
  text: string;
}

export class LabelElement extends Component<LabelProps, LabelState> {
  constructor(props: LabelProps) {
    super(props);
    this.setState({
      text: props.text,
    });
  }

  componentDidMount() {
    console.log(`label mounted with text ${this.state.text}`);
  }

  render(props: LabelProps, state: LabelState) {
    return <span id={props.id} class={props.cssClass} onClick={props.onClick}>{state.text}</span>;
  }
}