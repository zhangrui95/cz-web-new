import React from 'react'
import { List, Card, Row, Col, Button, Tag, Modal, Icon } from 'antd'
import styles from './style.less'

class warningDetails extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			basicId: '0',
			abnormalId: '0',
			itemId: '0',
			srcImg: '',
			visible: false
		}
	}
	dataKeyRender = (files) => {
		let arr = []
		for (var index in files) {
			// console.log(index ,":", files[index]);
			arr.push({
				value: files[index],
				name: index
			})
		}
		return arr
	}
	dataValueRender = (files) => {
		Object.values(files)
	}
	showAmplification = (files) => {
		console.log(files)
		// this.setState({visible: true, srcImg: files})
	}

	//   handleOk = () => {
	//       this.setState({visible: false,imgs: ''})
	//   }
	render() {
		const { files, closes } = this.props
		const { itemId, basicId, abnormalId } = this.state
		console.log(files)

		return (
			<div className={styles.tableListCard}>
				{files && (
					<div>
						<div className={styles.close} onClick={() => closes()}>
							<Icon type="close" />
						</div>

						{files.verificationPortraitDataList ? (
							<div>
								<div className={styles.headers}>
									{files.portrait_img_qriginal ? (
										<div className={styles.globalPicture}>
											<img src={files.portrait_img_qriginal} alt="信息图片" />
										</div>
									) : null}
									{files.portrait_img ? (
										<div className={styles.headersnapPicture}>
											<div className={styles.snapPicture}>
												<img src={files.portrait_img} alt="抓拍图片" />
											</div>
											<div className={styles.snapTime}>
												<span>{files.portrait_time}</span>
											</div>
										</div>
									) : null}
									{files.verificationPortraitDataList.length ? (
										<div className={styles.snaparrow}>
											<img src="./image/qieh.png" alt="左右箭头" />
										</div>
									) : null}
									<div className={styles.contrastBody}>
										{files.verificationPortraitDataList.length ? (
											files.verificationPortraitDataList.map((v, k) => (
												<div
													className={styles.contrastBodyItem}
													// style={{width: `${'calc(100%/'}${files.verificationPortraitDataList.length}${')'}`}}
													key={k}
													onClick={() => this.setState({ itemId: k })}
												>
													<div className={styles.contrastPicture}>
														<img src={v.path} alt="抓拍图片" />
														<div className={styles.tags}>
															{v.comparisonData.Tags.map((item, index) => (
																<div key={index} className={styles.tagItem}>
																	<Tag className={item == '正常' ? styles.normal : ''}>
																		{item}
																	</Tag>
																</div>
															))}
														</div>
													</div>
													<div className={styles.contrastNum}>
														<span className={itemId == k ? styles.contrastCol : ''}>
															{v.score}%
														</span>
													</div>
												</div>
											))
										) : null}
									</div>
								</div>
								<div>
									<Row>
										<Col span={12}>
											<div className={styles.basicInfor} style={{height: '532px'}}>
												<div>
													<div className={styles.groupButton}>
														<Button.Group>
															{files.verificationPortraitDataList.length ? (
																files.verificationPortraitDataList[
																	itemId
																].comparisonData.basicInformation.map((v, k) => (
																	<Button
																		key={k}
																		className={
																			basicId != k ? (
																				styles.basicUnSelect
																			) : (
																				styles.basicSelect
																			)
																		}
																		onClick={() => this.setState({ basicId: k })}
																	>
																		{v.tag}
																	</Button>
																))
															) : null}
														</Button.Group>
													</div>

													<Row>
														<Col span={12}>
															{files.verificationPortraitDataList.length ? (
																<div className={styles.basicInforTitle}>
																	{
																		files.verificationPortraitDataList[itemId]
																			.comparisonData.basicInformation[basicId]
																			.name
																	}
																</div>
															) : null}
														</Col>
														<Col span={12} style={{ textAlign: 'center' }}>
															{files.verificationPortraitDataList.length ? (
																<div className={styles.basicInforImg}>
																	<img
																		src={
																			files.verificationPortraitDataList[itemId]
																				.comparisonData.basicInformation[
																				basicId
																			].data[0].XP
																		}
																		alt="信息图片"
																	/>
																</div>
															) : null}
														</Col>
													</Row>
												</div>
												<div className={styles.basicInforColumn}>
													<ul>
														{this.dataKeyRender(
															files.verificationPortraitDataList.length &&
																files.verificationPortraitDataList[itemId]
																	.comparisonData.basicInformation[basicId].data[0]
														).map((v, k) => (
															<li key={k}>
																<span className={styles.titleColumn}>{v.name}</span>
																<span className={styles.textColumn}>{v.value}</span>
															</li>
														))}
													</ul>
												</div>
											</div>
										</Col>
										<Col span={12}>
											{files.verificationPortraitDataList.length &&
											files.verificationPortraitDataList[itemId].comparisonData
												.comparison_exception ? (
												<div className={styles.abnormalInfor} style={{height:'532px'}}>
													<div>
														<div className={styles.groupButton}>
															<Button.Group>
																{files.verificationPortraitDataList &&
																	files.verificationPortraitDataList[
																		itemId
																	].comparisonData.tagesInfoList.map((v, k) => (
																		<Button
																			key={k}
																			className={
																				abnormalId != k ? (
																					styles.abnormalUnSelect
																				) : (
																					styles.abnormalSelect
																				)
																			}
																			onClick={() =>
																				this.setState({ abnormalId: k })}
																		>
																			{v.tag}
																		</Button>
																	))}
															</Button.Group>
														</div>
														<Row>
															<Col span={22}>
																<div className={styles.abnormalInforTitle}>
																	{files.verificationPortraitDataList &&
																		files.verificationPortraitDataList[itemId]
																			.comparisonData.tagesInfoList[abnormalId]
																			.name}
																</div>
															</Col>
															<Col span={2} style={{ textAlign: 'center' }} />
														</Row>
													</div>
													<div className={styles.basicInforColumn}>
														<ul>
															{this.dataKeyRender(
																files.verificationPortraitDataList &&
																	files.verificationPortraitDataList[itemId]
																		.comparisonData.tagesInfoList[abnormalId]
																		.data[0]
															).map((v, k) => (
																<li key={k}>
																	<span
																		className={`${styles.titleColumn} ${styles.abnormalTitle}`}
																	>
																		{v.name}
																	</span>
																	<span
																		className={`${styles.textColumn} ${styles.abnormalText}`}
																	>
																		{v.value}
																	</span>
																</li>
															))}
														</ul>
													</div>
												</div>
											) : null}
										</Col>
									</Row>
								</div>
							</div>
						) : (
							<div>
								<Row>
									<Col span={12}>
										{files.basicInformation ? (
											<div className={styles.basicInfor} style={{height:'752px'}}>
												<div>
													<Row>
														<Col span={12} style={{ paddingLeft: '20px' }}>
															<Button.Group>
																{files.basicInformation.length ? (
																	files.basicInformation.map((v, k) => (
																		<Button
																			key={k}
																			className={
																				basicId != k ? (
																					styles.basicUnSelect
																				) : (
																					styles.basicSelect
																				)
																			}
																			onClick={() =>
																				this.setState({ basicId: k })}
																		>
																			{v.tag}
																		</Button>
																	))
																) : null}
															</Button.Group>
															{files.basicInformation.length ? (
																<div className={styles.basicInforTitle}>
																	{files.basicInformation[basicId].name}
																</div>
															) : null}
														</Col>
														<Col span={12} style={{ textAlign: 'center' }}>
															{files.basicInformation.length ? (
																<div className={styles.basicInforImg}>
																	{files.basicInformation[basicId].data[0] ? (
																		<img
																			src={
																				files.basicInformation[basicId].data[0]
																					.XP
																			}
																			alt="信息图片"
																		/>
																	) : null}
																</div>
															) : null}
														</Col>
													</Row>
												</div>
												<div
													className={`${styles.basicInforColumn} ${styles.basicInforColumnan}`}
												>
													<ul>
														{this.dataKeyRender(
															files.basicInformation.length &&
																files.basicInformation[basicId].data[0]
														).map((v, k) => (
															<li key={k}>
																<span className={styles.titleColumn}>{v.name}</span>
																<span className={styles.textColumn}>{v.value}</span>
															</li>
														))}
													</ul>
												</div>
											</div>
										) : null}
									</Col>
									<Col span={12}>
										{files.comparison_exception ? (
											<div className={styles.abnormalInfor} style={{height:'752px'}}>
												<div>
													<Row>
														<Col span={22} style={{ paddingLeft: '20px' }}>
															<Button.Group>
																{files.tagesInfoList &&
																	files.tagesInfoList.map((v, k) => (
																		<Button
																			key={k}
																			className={
																				abnormalId != k ? (
																					styles.abnormalUnSelect
																				) : (
																					styles.abnormalSelect
																				)
																			}
																			onClick={() =>
																				this.setState({ abnormalId: k })}
																		>
																			{v.tag}
																		</Button>
																	))}
															</Button.Group>
															<div className={styles.abnormalInforTitle}>
																{files.tagesInfoList &&
																	files.tagesInfoList[abnormalId].name}
															</div>
														</Col>
														<Col span={2} style={{ textAlign: 'center' }} />
													</Row>
												</div>
												<div
													className={`${styles.basicInforColumn} ${styles.basicInforColumnan}`}
												>
													<ul>
														{this.dataKeyRender(
															files.tagesInfoList &&
																files.tagesInfoList[abnormalId].data[0]
														).map((v, k) => (
															<li key={k}>
																<span
																	className={`${styles.titleColumn} ${styles.abnormalTitle}`}
																>
																	{v.name}
																</span>
																<span
																	className={`${styles.textColumn} ${styles.abnormalText}`}
																>
																	{v.value}
																</span>
															</li>
														))}
													</ul>
												</div>
											</div>
										) : null}
									</Col>
								</Row>
							</div>
						)}
					</div>
				)}
			</div>
		)
	}
}

export default warningDetails
