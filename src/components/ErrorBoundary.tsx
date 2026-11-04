import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Ловить помилки рендера в одній вкладці, щоб решта застосунку
 * не зникала в білий екран.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Помилка в розділі:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="glass-card mx-auto max-w-xl p-8 text-center animate-fade-up">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl bg-blush-100 text-blush-600">
          <TriangleAlert size={26} />
        </div>
        <h2 className="font-display text-2xl text-choco-800">Цей розділ не завантажився</h2>
        <p className="mt-2 text-sm leading-relaxed text-choco-500">
          Решта застосунку працює. Спробуй відкрити розділ ще раз — дані в профілі не втрачено.
        </p>
        <button onClick={() => this.setState({ error: null })} className="btn-primary mt-6">
          <RefreshCw size={17} /> Спробувати знову
        </button>
      </div>
    );
  }
}
