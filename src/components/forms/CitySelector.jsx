import { Form } from "react-bootstrap";

const CITY_OPTIONS = [
  "Madison, US",
  "Milwaukee, US",
  "Chicago, US",
  "Minneapolis, US",
  "New York, US",
  "San Francisco, US",
  "Seattle, US",
  "London, GB",
  "Delhi, IN"
];

export default function CitySelector(props) {
  const handleChange = (event) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return (
    <>
      <Form.Label htmlFor={props.id}>{props.label}</Form.Label>
      <Form.Control
        id={props.id}
        type="text"
        list={`${props.id}-options`}
        placeholder="Start typing a city (e.g., Madison, US)"
        value={props.value}
        onChange={handleChange}
        aria-describedby={`${props.id}-hint`}
        autoComplete="off"
      />
      {/* Keep instructions for assistive tech, but hide visually so layout stays aligned */}
      <div id={`${props.id}-hint`} className="form-text visually-hidden">
        Begin typing and then choose a city from the suggestions.
      </div>
      <datalist id={`${props.id}-options`}>
        {CITY_OPTIONS.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </>
  );
}
