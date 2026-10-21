import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/Loader';

export default function NotFound() {
  return (
    <EmptyState title="This page drifted off to sleep" text="The link may be broken or the page may have moved.">
      <Button variant="outline" to="/">
        Back home
      </Button>
    </EmptyState>
  );
}
