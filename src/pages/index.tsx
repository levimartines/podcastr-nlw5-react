import React from 'react';

export default function Home(props) {
  return (
    <>
      <h1>Hello World!</h1>
    </>
  );
}

export async function getStaticProps() {
  const response = await fetch('http://localhost:3333/episodes');
  const episodes = await response.json();

  return {
    props: {
      episodes
    },
    revalidate: 60 * 60 * 8
  };
}
