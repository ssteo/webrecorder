import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { fromJS } from 'immutable';
import { Button, Col, Row } from 'react-bootstrap';

import HttpStatus from 'components/HttpStatus';
import RedirectWithStatus from 'components/RedirectWithStatus';
import WYSIWYG from 'components/WYSIWYG';
import { NewCollection } from 'components/siteComponents';
import { Upload } from 'containers';

import CollectionItem from './CollectionItem';
import './style.scss';


class CollectionListUI extends Component {
  static contextTypes = {
    isAnon: PropTypes.bool
  };

  static propTypes = {
    auth: PropTypes.object,
    collections: PropTypes.object,
    createNewCollection: PropTypes.func,
    edited: PropTypes.bool,
    editCollection: PropTypes.func,
    editUser: PropTypes.func,
    orderedCollections: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    user: PropTypes.object
  };

  static defaultProps = fromJS({
    collections: []
  });

  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      isPublic: false,
      collTitle: 'New Collection',
    };
  }

  createCollection = (collTitle, isPublic) => {
    const { createNewCollection, match: { params: { user } } } = this.props;
    createNewCollection(user, collTitle, isPublic);
  }

  toggle = () => {
    this.setState({ showModal: !this.state.showModal });
  }

  close = () => {
    this.setState({ showModal: false });
  }

  updateUser = (description) => {
    const { editUser, match: { params: { user } } } = this.props;
    editUser(user, { desc: description });
  }

  render() {
    const { isAnon } = this.context;
    const { auth, collections, editCollection, history, orderedCollections, match: { params }, user } = this.props;
    const { showModal } = this.state;
    const userParam = params.user;
    const canAdmin = auth.getIn(['user', 'username']) === userParam;

    if (collections.get('error')) {
      return (
        <HttpStatus>
          {collections.getIn(['error', 'error_message'])}
        </HttpStatus>
      );
    }

    if (collections.get('loaded') && isAnon && canAdmin) {
      return <RedirectWithStatus to={`/${auth.getIn(['user', 'username'])}/temp/index`} status={301} />;
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{`${userParam}'s Collections`}</title>
        </Helmet>
        <Row>

          <Col xs={12} sm={3} className="collection-description page-archive">
            <h2>{ userParam }</h2>
            <p className="collection-username">{ userParam }</p>
            <WYSIWYG
              key={user.get('id')}
              initial={user.get('desc') || ''}
              onSave={this.updateUser}
              placeholder={'Add a description'}
              clickToEdit
              readOnly={isAnon || !canAdmin}
              success={this.props.edited} />
          </Col>
          <Col xs={12} sm={9} className="wr-coll-meta">

            <Row>
              <Col xs={12} className="collections-index-nav">
                {
                  !isAnon && canAdmin &&
                    <React.Fragment>
                      <Button onClick={this.toggle} className="rounded">
                        <span className="glyphicon glyphicon-plus glyphicon-button" /> New Collection
                      </Button>
                      <Upload classes="rounded">
                        <span className="glyphicon glyphicon-upload" /> Upload
                      </Upload>
                    </React.Fragment>
                }
              </Col>
            </Row>
            {

              collections && collections.get('loaded') &&
                <Row>
                  <ul className="list-group collection-list">
                    {
                      orderedCollections.map((coll) => {
                        return (
                          <CollectionItem
                            key={coll.get('id')}
                            canAdmin={canAdmin}
                            collection={coll}
                            editCollection={editCollection}
                            history={history} />
                        );
                      })
                    }
                  </ul>
                </Row>
            }
          </Col>
        </Row>
        <NewCollection
          close={this.close}
          visible={showModal}
          createCollection={this.createCollection}
          creatingCollection={collections.get('creatingCollection')}
          error={collections.get('creationErorr')} />
      </React.Fragment>
    );
  }
}


export default CollectionListUI;
