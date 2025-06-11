import React, { useState } from 'react';

const DoloreCard = () => {
  const [visibleIndex, setVisibleIndex] = useState(null);

  const toggleContent = (index) => {
    setVisibleIndex(visibleIndex === index ? null : index);
  };

  const sections = [
    {
      title: "Assumenda doloribus est fugiat sint incidunt animi totamnisi ?",
      content: "Ut quasi odit odio totam accusamus vero eius. Nostrum asperiores voluptatem eos nulla ab dolores est asperiores iure. Quo est quis praesentium aut maiores. Corrupti sed aut expedita fugit vero dolorem. Nemo rerum sapiente. A quaerat dignissimos."
    },
    {
      title: "Consequatur saepe explicabo odio atque nisi ?",
      content: "In minus quia impedit est quas deserunt deserunt et. Nulla non quo dolores minima fugiat aut saepe aut inventore. Qui nesciunt odio officia beatae iusto sed voluptatem possimus quas. Officia vitae sit voluptatem nostrum a."
    },
    {
      title: "Voluptates vel est fugiat molestiae rem sit eos sint ?",
      content: "Voluptates magni amet enim perspiciatis atque excepturi itaque est. Sit beatae animi incidunt eum repellat sequi ea saepe inventore. Id et vel et et. Nesciunt itaque corrupti quia ducimus. Consequatur maiores voluptatum fuga quod ut non fuga."
    },
    {
      title: "Ab ipsa cum autem voluptas doloremque velit ?",
      content: "Numquam ut reiciendis aliquid. Quia veritatis quasi ipsam sed quo ut eligendi et non. Doloremque sed voluptatem at in voluptas aliquid dolorum."
    },
    {
      title: "Aliquam magni ducimus facilis numquam dolorum harum eveniet iusto ?",
      content: "Aut necessitatibus maxime quis dolor et. Nihil laboriosam molestiae qui molestias placeat corrupti non quo accusamus. Nemo qui quis harum enim sed. Aliquam molestias pariatur delectus voluptas quidem qui rerum id quisquam. Perspiciatis voluptatem voluptatem eos. Vel aut minus labore at rerum eos."
    }
  ];

  return (
    <div className="card">
      <p><strong>Dolore occaecati ducimus quam</strong></p>
      {sections.map((section, index) => (
        <div key={index}>
          <p onClick={() => toggleContent(index)} style={{ cursor: 'pointer' }}>
            {section.title}
          </p>
          {visibleIndex === index && (
            <span>{section.content}</span>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default DoloreCard;
