import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '@/components/quiz/ColorPicker';
import { PersonalitySliders } from '@/components/quiz/PersonalitySliders';
import { CitySearch } from '@/components/quiz/CitySearch';
import { NostalgiaSettingOptions } from '@/components/quiz/NostalgiaSettingOptions';
import { IdentityOptions } from '@/components/quiz/IdentityOptions';
import type { QuizAnswers } from '@/contexts/QuizContext';

interface QuestionRendererProps {
  question: any;
  answers: QuizAnswers;
  updateAnswer: (key: keyof QuizAnswers, value: any) => void;
  keyField: 'answer_key' | 'question_key';
}

const SCENT_FAMILIES = [
  { value: 'Floral', emoji: '🌸' },
  { value: 'Woody', emoji: '🌲' },
  { value: 'Fresh', emoji: '🌊' },
  { value: 'Oriental', emoji: '🌟' },
  { value: 'Gourmand', emoji: '🍰' },
  { value: 'Spicy', emoji: '🌶️' },
  { value: 'Herbal/Green', emoji: '🌿' },
];

export const QuestionRenderer = ({
  question,
  answers,
  updateAnswer,
  keyField,
}: QuestionRendererProps) => {
  if (!question) return null;

  const answerKey = question[keyField] as keyof QuizAnswers;
  const currentAnswer = answers[answerKey];

  const heading = (
    <h2
      className="font-display text-cream text-balance"
      style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
    >
      {question.question_text}
    </h2>
  );

  const helper =
    question.helper_text || (question.question_type === 'scent_family' ? 'Select one or more' : null);

  const wrap = (children: React.ReactNode) => (
    <div className="space-y-8">
      {heading}
      {helper && <p className="text-gold-muted text-base md:text-lg">{helper}</p>}
      <div>{children}</div>
    </div>
  );

  switch (question.question_type) {
    case 'radio':
      if (question.answer_key === 'setting') {
        return (
          <NostalgiaSettingOptions
            options={question.options || []}
            value={(currentAnswer as string) || ''}
            onChange={(val) => updateAnswer(answerKey, val)}
            heading={heading}
            helper={helper}
            questionText={question.question_text}
          />
        );
      }
      if (question.answer_key === 'gender') {
        return (
          <IdentityOptions
            options={question.options || []}
            value={(currentAnswer as string) || ''}
            onChange={(val) => updateAnswer(answerKey, val)}
            helper={helper}
            questionText={question.question_text}
          />
        );
      }
      return wrap(
        <RadioGroup
          value={(currentAnswer as string) || ''}
          onValueChange={(val) => updateAnswer(answerKey, val)}
          className="space-y-3"
        >
          {(question.options || []).map((option: any) => {
            const value = typeof option === 'string' ? option : option.value;
            const desc = typeof option === 'object' ? option.desc : null;
            const selected = currentAnswer === value;
            return (
              <Label
                key={value}
                htmlFor={`opt-${value}`}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all hover:bg-bz-card/60 ${
                  selected
                    ? 'border-gold-strong bg-bz-card glow-gold-sm'
                    : 'border-gold bg-bz-card/40'
                }`}
              >
                <RadioGroupItem value={value} id={`opt-${value}`} />
                <span className="flex-1">
                  <span className="block text-lg md:text-xl text-cream font-medium">{value}</span>
                  {desc && <span className="block text-sm text-cream-muted mt-1">{desc}</span>}
                </span>
              </Label>
            );
          })}
        </RadioGroup>
      );

    case 'city_search':
      return wrap(
        <CitySearch
          value={(currentAnswer as string) || ''}
          onChange={(val) => updateAnswer(answerKey, val)}
        />
      );

    case 'color_picker':
      return wrap(
        <ColorPicker
          hue={answers.colorHue ?? 0}
          saturation={answers.colorSaturation ?? 100}
          onHueChange={(val) => updateAnswer('colorHue', val)}
          onSaturationChange={(val) => updateAnswer('colorSaturation', val)}
        />
      );

    case 'personality_sliders':
      return (
        <PersonalitySliders
          traits={question.traits || question.options || []}
          values={answers.personalityTraits || {}}
          questionText={question.question_text}
          helperText={helper}
          onChange={(traitId, value) => {
            updateAnswer('personalityTraits', {
              ...(answers.personalityTraits || {}),
              [traitId]: value,
            });
          }}
        />
      );


    case 'scent_family': {
      const selected = Array.isArray(currentAnswer)
        ? (currentAnswer as string[])
        : currentAnswer
        ? [currentAnswer as string]
        : [];
      const toggle = (value: string) => {
        const updated = selected.includes(value)
          ? selected.filter((f) => f !== value)
          : [...selected, value];
        updateAnswer(answerKey, updated as any);
      };
      return wrap(
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {SCENT_FAMILIES.map((s) => {
            const isOn = selected.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggle(s.value)}
                className={`p-5 md:p-6 rounded-xl border-2 transition-all text-center ${
                  isOn
                    ? 'border-gold-strong bg-bz-card glow-gold-sm scale-[1.02]'
                    : 'border-gold bg-bz-card/40 hover:bg-bz-card/70'
                }`}
              >
                <div className="text-3xl md:text-4xl mb-2">{s.emoji}</div>
                <div className="text-cream font-medium">{s.value}</div>
              </button>
            );
          })}
        </div>
      );
    }

    case 'occasion':
      return wrap(
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {(question.options || []).map((occ: string) => {
            const isOn = currentAnswer === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() => updateAnswer(answerKey, occ)}
                className={`p-5 md:p-6 rounded-xl border-2 transition-all ${
                  isOn
                    ? 'border-gold-strong bg-bz-card glow-gold-sm scale-[1.02]'
                    : 'border-gold bg-bz-card/40 hover:bg-bz-card/70'
                }`}
              >
                <span className="text-cream font-medium">{occ}</span>
              </button>
            );
          })}
        </div>
      );

    case 'slider': {
      const min = question.min ?? question.min_value ?? 1;
      const max = question.max ?? question.max_value ?? 10;
      const value = (currentAnswer as number) ?? min;
      return wrap(
        <div className="pt-4 px-2">
          <Slider
            value={[value]}
            onValueChange={(v) => updateAnswer(answerKey, v[0])}
            min={min}
            max={max}
            step={1}
            className="mb-6"
          />
          <div className="flex justify-between text-sm text-cream-muted">
            <span>Subtle ({min})</span>
            <span className="text-2xl font-display text-gold">{value}</span>
            <span>Bold ({max})</span>
          </div>
        </div>
      );
    }

    case 'text':
      return wrap(
        <Input
          type="text"
          autoFocus
          placeholder={question.placeholder || ''}
          value={(currentAnswer as string) || ''}
          onChange={(e) => updateAnswer(answerKey, e.target.value)}
          className="text-lg md:text-xl p-6 bg-bz-card/60 border-gold text-cream placeholder:text-cream-muted/60"
        />
      );

    default:
      return wrap(
        <p className="text-cream-muted">Question type not supported: {question.question_type}</p>
      );
  }
};
