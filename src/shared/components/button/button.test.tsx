import {render} from '@testing-library/react';
import {Button} from './button.component';

describe('Button component', () => {
  test('renders button with props ', () => {
    const {getByText, getByRole} = render(<Button>Test button</Button>);

    expect(getByRole('button')).toBeInTheDocument();
    expect(getByText(/test button/i)).toBeInTheDocument();
  });

  test('applies props correct', () => {
    const {getByRole} = render(<Button data-testid="button">Test button</Button>);

    expect(getByRole('button')).toHaveAttribute('data-testid', 'button');
  });

  test('applies styles correct', () => {
    const {getByRole} = render(<Button className="testButtonClass">Test button</Button>);

    expect(getByRole('button')).toHaveClass('button testButtonClass');
  });
});
