import { SyntheticEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMeals } from '../utils/fetch';
import { getFlag, mapObjValuesToArray, objForEach } from '../utils/helpers';
import { ObjForEach } from '../utils/interfaces';
import { GiHotMeal } from 'react-icons/gi';
import {
  IoIosShareAlt,
  IoMdStar,
  IoMdText,
  IoIosBookmark,
} from 'react-icons/io';
import Author from '../components/Author';
import TopNavigationBar from '../components/TopNavigationBar';

interface IngredientsAndMeasures {
  ingredients: Array<string>;
  measures: Array<string>;
}

// TODO: Implement real reviews:
const reviews = Math.ceil(Math.random() * 100);

function Details() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<ObjForEach>({});
  const [ingredients, setIngredients] = useState<IngredientsAndMeasures>({
    ingredients: [''],
    measures: [''],
  });
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [loadVideo, setLoadVideo] = useState(false);
  const [steps, setSteps] = useState(0);
  const [backgroundFade, setBackgroundFade] = useState(false);

  async function getDetails() {
    const [details] = await getMeals(null, null, null, id);

    setRecipe(details);
    setIngredients(getIngredientsList(details));
    setSteps(getRecipeSteps(details));
  }

  function getIngredientsList(recipe: ObjForEach) {
    const ingredients = objForEach(
      recipe,
      (key, value) => key.includes('strIngredient') && value
    );
    const ingArray = mapObjValuesToArray(ingredients);
    const measures = objForEach(
      recipe,
      (key, value) => key.includes('strMeasure') && value
    );
    const measuresArray = mapObjValuesToArray(measures);

    return {
      ingredients: ingArray,
      measures: measuresArray,
    };
  }

  function getRecipeSteps(recipe: ObjForEach) {
    return recipe.strInstructions.split('\r\n').length;
  }

  function renderIngredientsList(ing: IngredientsAndMeasures) {
    const { ingredients, measures } = ing;
    const list = ingredients.map((ing, i) => (
      <li key={`${ing}${i}`} className="details-ing-li">
        <span className="details-ing-li--ing">{ing}</span>
        <span className="details-ing-li--measure">{measures[i]}</span>
      </li>
    ));
    return list;
  }

  // TODO: Implement the "recipe progress track" using local state and localStorage;
  function handleCheckbox(e: SyntheticEvent) {
    const tgt = e.target as HTMLInputElement;
    tgt
      .closest('.details-procedures-li')
      ?.querySelector('.details-proc-li--body')
      ?.classList.toggle('td-lt');
  }

  function renderProceduresList(ing: ObjForEach) {
    const { strInstructions } = ing;
    const instructions = strInstructions.split('\r\n');

    const list = instructions.map((inst: string, i: number) => (
      <li key={i} className="details-procedures-li">
        <div className="flex flex-jc-sb flex-align">
          <p className="details-proc-li--heading">{`Step ${i + 1}`}</p>
          <div className="flex flex-center flex-gap-04 fstyle-i">
            <label className="fs-11 color-grey-dark-1">
              Check as completed
            </label>
            <input type="checkbox" onChange={handleCheckbox} />
          </div>
        </div>
        <p className="details-proc-li--body">{inst}</p>
      </li>
    ));
    return list;
  }

  function renderTags(recipe: ObjForEach) {
    const tags = recipe.strTags.split(',');
    const markup = tags.map((tag: string) => (
      <p key={tag} className="details-tags">
        {tag.toUpperCase()}
      </p>
    ));
    return markup;
  }

  function handleTabs() {
    setActiveTab((prev) => {
      if (prev === 'Ingredients') return 'Procedures';
      return 'Ingredients';
    });
  }

  function RenderImgOrVideo() {
    if (activeTab === 'Ingredients')
      return (
        <div
          className="details-img flex"
          style={{ backgroundImage: `url('${recipe.strMealThumb}')` }}
        >
          <img
            src={getFlag(recipe.strArea)}
            alt={recipe.strMeal}
            className="details-img__flag"
          />
        </div>
      );
    if (!loadVideo)
      return (
        <div
          className="details-img details-img--fake-player flex pos-rel"
          style={{ backgroundImage: `url('${recipe.strMealThumb}')` }}
          onClick={() => setLoadVideo(true)}
        >
          <img
            src={getFlag(recipe.strArea)}
            alt={recipe.strMeal}
            className="details-img__flag"
          />
        </div>
      );
    else
      return (
        <iframe
          className="details-video"
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${recipe.strYoutube
            .split('=')
            .at(1)}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
  }

  function RenderIngredientsOrProcedures() {
    if (activeTab === 'Ingredients')
      return (
        <ul className="details-ing-ul">
          {ingredients.ingredients && renderIngredientsList(ingredients)}
        </ul>
      );
    return <ul className="details-ing-ul">{renderProceduresList(recipe)}</ul>;
  }

  function backgroundHandler() {
    setBackgroundFade((prev) => !prev);
  }

  const menuBarAndBackground = () => {
    if (backgroundFade)
      return (
        <div className="nav-menu-bg">
          <div
            className="flex flex-col flex-gap-08 nav-menu"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="flex flex-gap-06 flex-align">
              <IoIosShareAlt />
              <p>Share</p>
            </div>
            <div className="flex flex-gap-06 flex-align">
              <IoMdStar />
              <p>Rate Recipe</p>
            </div>
            <div className="flex flex-gap-06 flex-align">
              <IoMdText />
              <p>Review</p>
            </div>
            <div className="flex flex-gap-06 flex-align">
              <IoIosBookmark />
              <p>Bookmark</p>
            </div>
          </div>
        </div>
      );
    return <p>{''}</p>;
  };

  useEffect(() => {
    getDetails();
  }, []);

  return (
    <section
      className="page-container flex flex-col flex-gap-20"
      onClick={() => {
        if (backgroundFade) setBackgroundFade(false);
      }}
    >
      <div className="flex flex-col flex-gap-06">
        <TopNavigationBar
          backgroundHandler={backgroundHandler}
          menuAndBackground={menuBarAndBackground}
        />
        <RenderImgOrVideo />
        <div className="flex flex-gap-06">
          {recipe.strTags && renderTags(recipe)}
        </div>
        <div className="details-title">
          <p className="details-title--heading">{recipe.strMeal}</p>
          <p className="details-title--reviews">{`(${reviews} Reviews)`}</p>
        </div>
        <Author />
      </div>
      <div className="flex flex-col flex-gap-14">
        <div className="details-tabs" onClick={handleTabs}>
          <button
            type="button"
            className={`details-tabs__links ${
              activeTab === 'Ingredients' ? 'details-tabs__links--active' : ''
            }`}
          >
            Ingredients
          </button>
          <button
            type="button"
            className={`details-tabs__links ${
              activeTab === 'Procedures' ? 'details-tabs__links--active' : ''
            }`}
          >
            Procedures
          </button>
        </div>
        <div className="flex flex-jc-sb color-grey-dark-1">
          <div className="flex flex-gap-08">
            <GiHotMeal className="details-meal-icon" />
            <span className="fs-12"> 1 serve</span>
          </div>
          {activeTab === 'Ingredients' ? (
            <p className="fs-12">{ingredients.ingredients.length} items</p>
          ) : (
            <p className="fs-12">{steps} steps</p>
          )}
        </div>
        <RenderIngredientsOrProcedures />
      </div>
    </section>
  );
}

export default Details;