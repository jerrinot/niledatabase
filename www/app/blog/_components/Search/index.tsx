"use client";
import Image from "next/image";
import algoliasearch from "algoliasearch/lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  InstantSearch,
  useHits,
  useRefinementList,
  useSearchBox,
} from "react-instantsearch";
import Link from "next/link";
import { Authors } from "../Authors";
import { Metadata } from "../Metadata";

const searchClient = algoliasearch(
  String(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID),
  String(process.env.NEXT_PUBLIC_ALGOLIA_API_KEY)
);
function RefinementItem({
  item,
  refine,
}: {
  item: any;
  refine: (value: string) => void;
}) {
  const [selected, setSelected] = useState<"selected" | "normal">("normal");

  const borderColors = {
    selected: "border-lightGray",
    normal: "border-gray text-transparent",
  };
  const onClick = useCallback(() => {
    if (selected !== "selected") {
      setSelected("selected");
    } else {
      setSelected("normal");
    }
    refine(item.value);
  }, [selected]);

  return (
    <button
      onClick={onClick}
      className={`border ${borderColors[selected]} hover:border-lightGray rounded-xl px-4 py-3 text-[16px] leading-[20px] bg-gradient-white bg-clip-text whitespace-nowrap`}
    >
      {item.label}
    </button>
  );
}

function RefinementList() {
  const { items, refine } = useRefinementList({ attribute: "tags" });
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.value.localeCompare(b.value)),
    [items]
  );
  return (
    <div className="flex flex-row items-center gap-6 overflow-y-scroll md:max-w-[400px] lg:max-w-[1000px]">
      {sortedItems.map((item) => (
        <RefinementItem key={item.label} item={item} refine={refine} />
      ))}
    </div>
  );
}
function Hits() {
  const { hits } = useHits();
  return (
    <div className="mx-auto w-[91%]">
      <div className="flex flex-row gap-8 flex-wrap justify-start">
        {!hits.length && (
          <div className="text-4xl">No blogs match your criteria.</div>
        )}
        {hits.map((hit) => {
          return <Hit hit={hit} key={hit.objectID} />;
        })}
      </div>
    </div>
  );
}

function Hit({ hit }: any) {
  const [, publishDate] = /.+(\d{4}-\d{2}-\d{2}).+/.exec(hit.objectID) ?? [];
  const cleaned = hit.objectID.replace(/\d{4}-\d{2}-\d{2}-/, "");
  const slug = cleaned.replace(".mdx", "");
  return (
    <Link href={`/blog/${slug}`}>
      <div className="w-[384px]">
        <div className="bg-[#2D2D2D] rounded-xl w-[384px] h-[242px] overflow-hidden flex-shrink-0 mb-4 items-center justify-center flex">
          {hit?.image ? (
            <Image
              priority
              alt={hit.image}
              width={384}
              height={242}
              src={`/blog/${hit.image}`}
            />
          ) : (
            <Image
              priority
              alt="coffee"
              width={384}
              height={242}
              src={`/blog/coffee.jpg`}
            />
          )}
        </div>
        <Metadata
          publishDate={publishDate}
          readLength={hit?.readLength}
          title={hit?.title}
          sizzle={hit?.sizzle}
        />
        <Authors authors={hit?.authors} />
      </div>
    </Link>
  );
}

function SearchBox() {
  const { query, refine } = useSearchBox();
  const [width, setWidth] = useState<"norm" | "max">("norm");

  const widths = {
    norm: "left-[75%]",
    max: "left-[50%]",
  };
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    refine(inputValue);
  }, [inputValue]);

  return (
    <div
      className={`transition-[left] duration-[500ms] absolute right-0 ${widths[width]}`}
    >
      <div className="absolute w-[100px] h-[52px] bg-horizontal-fade -left-[76px] -top-[1px]"></div>
      <div
        className={`py-1 w-full flex flex-row relative z-10 px-2 border border-[#242627] bg-black rounded-[12px] items-center gap-[10px]`}
      >
        <Image
          className="ml-3"
          src="/icons/search.svg"
          alt="looking glass"
          width={24}
          height={24}
        />
        <input
          className={`bg-black w-full border-none text-lg leading-10 focus:outline-none py-[1px] placeholder:opacity-40`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Search"
          spellCheck={false}
          maxLength={512}
          type="search"
          value={inputValue}
          onFocus={() => {
            setWidth("max");
          }}
          onBlur={() => {
            setWidth("norm");
          }}
          onChange={(event) => {
            setInputValue(event.currentTarget.value);
          }}
        />
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <InstantSearch searchClient={searchClient} indexName="blog">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row items-center gap-4 justify-between -mt-5 z-10 relative">
          <RefinementList />
          <SearchBox />
        </div>
        <Hits />
      </div>
    </InstantSearch>
  );
}