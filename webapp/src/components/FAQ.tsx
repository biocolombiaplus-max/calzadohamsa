'use client';

import { useSiteSettings } from '@/lib/settings-context';
import Accordion, { AccordionItem } from '@/components/product/Accordion';

export default function FAQ() {
  const { faqHeading, faq } = useSiteSettings();

  if (faq.length === 0) return null;

  return (
    <section className="bg-cream-alt py-14">
      <div className="container-page">
        <h2 className="mb-8 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">{faqHeading}</h2>
        <div className="mx-auto max-w-2xl">
          <Accordion>
            {faq.map((item, i) => (
              <AccordionItem key={item.question + i} title={item.question} defaultOpen={i === 0}>
                <p className="whitespace-pre-line">{item.answer}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
